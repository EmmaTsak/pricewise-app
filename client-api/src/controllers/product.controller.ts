import { Request, Response } from "express";
import prisma from "../config/prisma";
import { getIO } from "../sockets/socket";
import { cache } from "../utils/cache";

const getSingleQueryValue = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0];
  }

  return undefined;
};

// GET /products
export const getProducts = async (req: Request, res: Response) => {
  try {
    const cacheKey = JSON.stringify(req.query);
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    const supermarket = getSingleQueryValue(req.query.supermarket);
    const category = getSingleQueryValue(req.query.category);

    // This object will hold any filters sent by the frontend
    const filters: any = {};

    if (supermarket) {
      filters.supermarket = supermarket;
    }

    if (category) {
      filters.categoryName = category;
    }

    const products = await prisma.product.findMany({
      where: filters,
      orderBy: {
        updatedAt: "desc",
      },
    });

    cache.set(cacheKey, products);

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

// GET /products/meta
export const getProductMeta = async (_req: Request, res: Response) => {
  try {
    /*
      We only want categories that have useful comparison groups.

      A useful group means:
      - the group exists
      - it has products from at least 2 different supermarkets

      Example:
      If "Milk" has AB + Lidl products, show the Milk category.
      If "Pizza" only has Galaxias products, do not show that category yet.
    */
    const groups = await prisma.productGroup.findMany({
      select: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        products: {
          select: {
            supermarket: true,
          },
        },
      },
    });

    /*
      We use a Map so each category appears only once.

      Without this, if one category has 50 groups,
      the category could appear 50 times.
    */
    const categoryMap = new Map<
      string,
      {
        id: string;
        name: string;
        slug: string;
      }
    >();

    for (const group of groups) {
      const supermarkets = new Set(
        group.products.map((product) => product.supermarket)
      );

      /*
        Only keep the category if this group has products
        from at least 2 supermarkets.
      */
      if (supermarkets.size >= 2) {
        categoryMap.set(group.category.slug, group.category);
      }
    }

    const categories = Array.from(categoryMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    const supermarkets = await prisma.product.findMany({
      select: {
        supermarket: true,
      },
      distinct: ["supermarket"],
      orderBy: {
        supermarket: "asc",
      },
    });

    res.json({
      categories,
      supermarkets: supermarkets.map((s) => s.supermarket),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to fetch metadata",
    });
  }
};

// POST /products
export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      name,
      productKey,
      price,
      supermarket,
      categoryName,
      photoURL,
      url,
    } = req.body;

    // Basic validation
    if (!name || !productKey || !price || !supermarket || !categoryName) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    const product = await prisma.product.upsert({
      where: {
        productKey_supermarket: {
          productKey,
          supermarket,
        },
      },
      update: {
        name,
        price,
        categoryName,
        photoURL,
        url,
      },
      create: {
        name,
        productKey,
        price,
        supermarket,
        categoryName,
        photoURL,
        url,
      },
    });

    // Notify frontend that a product price was added or updated
    getIO().emit("price-updated", product);

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to create product",
    });
  }
};

// GET /products/groups
export const getProductGroups = async (req: Request, res: Response) => {
  try {
    const search = getSingleQueryValue(req.query.search);
    const category = getSingleQueryValue(req.query.category);
    const supermarketsQuery = getSingleQueryValue(req.query.supermarkets);

    /*
      supermarketsQuery example:
      "AB,Lidl,Sklavenitis"
    */
    const selectedSupermarkets = supermarketsQuery
      ? supermarketsQuery
          .split(",")
          .map((supermarket) => supermarket.trim())
          .filter(Boolean)
      : [];

    const groups = await prisma.productGroup.findMany({
      where: {
        name: search
          ? {
              contains: search,
              mode: "insensitive",
            }
          : undefined,

        category: category
          ? {
              slug: category,
            }
          : undefined,
      },
      include: {
        category: true,
        products: {
          select: {
            id: true,
            supermarket: true,
            price: true,
            photoURL: true,
          },
          orderBy: {
            price: "asc",
          },
        },
      },
      orderBy: {
        name: "asc",
      },
      take: 9000,
    });

    const comparableGroups = groups
      .map((group) => {
        /*
          If the user selected stores, we only keep products from those stores.
          If not, we keep all products.
        */
        const visibleProducts =
          selectedSupermarkets.length > 0
            ? group.products.filter((product) =>
                selectedSupermarkets.includes(product.supermarket)
              )
            : group.products;

        /*
          Sort the visible products by price.

          Why?
          Because lowestPrice should always come from the cheapest visible product,
          not just the first product in the array.
        */
        const sortedVisibleProducts = [...visibleProducts].sort((a, b) => {
          return Number(a.price) - Number(b.price);
        });

        const supermarkets = new Set(
          sortedVisibleProducts.map((product) => product.supermarket)
        );

        return {
          id: group.id,
          name: group.name,
          size: group.size,
          imageUrl: group.imageUrl,
          productImages: sortedVisibleProducts.map((product) => product.photoURL),
          category: {
            id: group.category.id,
            name: group.category.name,
            slug: group.category.slug,
          },
          lowestPrice: sortedVisibleProducts[0]?.price ?? null,
          supermarketCount: supermarkets.size,
          supermarkets: Array.from(supermarkets),
        };
      })
      .filter((group) => group.supermarketCount >= 2);

    res.json(comparableGroups);
  } catch (error) {
    console.error("Failed to fetch product groups:", error);

    res.status(500).json({
      error: "Failed to fetch product groups",
    });
  }
};

// GET /products/groups/:groupId/compare
export const compareProductGroupPrices = async (
  req: Request,
  res: Response
) => {
  try {
    const { groupId } = req.params;

    if (!groupId) {
      return res.status(400).json({
        error: "Missing product group id",
      });
    }

    const supermarketsQuery = getSingleQueryValue(req.query.supermarkets);

    const selectedSupermarkets = supermarketsQuery
      ? supermarketsQuery
          .split(",")
          .map((supermarket) => supermarket.trim())
          .filter(Boolean)
      : [];

    const group = await prisma.productGroup.findUnique({
      where: {
        id: groupId as string,
      },
      include: {
        category: true,
        products: {
          select: {
            id: true,
            name: true,
            supermarket: true,
            price: true,
            photoURL: true,
            url: true,
            updatedAt: true,
          },
          orderBy: {
            price: "asc",
          },
        },
      },
    });

    if (!group) {
      return res.status(404).json({
        error: "Product group not found",
      });
    }

    /*
      The group may accidentally contain more than one product
      from the same supermarket.

      For comparison, we return only the cheapest product
      from each supermarket.
    */
    const cheapestBySupermarket = new Map<
      string,
      (typeof group.products)[number]
    >();

    for (const product of group.products) {
      /*
        If user selected supermarkets, only show those.
      */
      if (
        selectedSupermarkets.length > 0 &&
        !selectedSupermarkets.includes(product.supermarket)
      ) {
        continue;
      }

      if (!cheapestBySupermarket.has(product.supermarket)) {
        cheapestBySupermarket.set(product.supermarket, product);
      }
    }

    const comparisonProducts = Array.from(
      cheapestBySupermarket.values()
    ).sort((a, b) => Number(a.price) - Number(b.price));

    res.json({
      id: group.id,
      name: group.name,
      size: group.size,
      imageUrl: group.imageUrl,
      category: {
        id: group.category.id,
        name: group.category.name,
        slug: group.category.slug,
      },
      supermarketCount: comparisonProducts.length,
      products: comparisonProducts,
    });
  } catch (error) {
    console.error("Failed to compare product group prices:", error);

    res.status(500).json({
      error: "Failed to compare product prices",
    });
  }
};

export const debugProductGroups = async (_req: Request, res: Response) => {
  try {
    const totalProducts = await prisma.product.count();

    const productsWithoutGroup = await prisma.product.count({
      where: {
        productGroupId: null,
      },
    });

    const totalGroups = await prisma.productGroup.count();

    const groups = await prisma.productGroup.findMany({
      include: {
        category: true,
        products: {
          select: {
            id: true,
            name: true,
            supermarket: true,
            price: true,
          },
        },
      },
      take: 50,
      orderBy: {
        updatedAt: "desc",
      },
    });

    const debugGroups = groups.map((group: typeof groups[number]) => {
      const supermarkets = new Set(
        group.products.map((product: typeof group.products[number]) => product.supermarket)
      );

      return {
        id: group.id,
        name: group.name,
        normalizedName: group.normalizedName,
        category: group.category.name,
        productCount: group.products.length,
        supermarketCount: supermarkets.size,
        supermarkets: Array.from(supermarkets),
        products: group.products,
      };
    });

    res.json({
      totalProducts,
      productsWithoutGroup,
      totalGroups,
      sampleGroups: debugGroups,
    });
  } catch (error) {
    console.error("Failed to debug product groups:", error);

    res.status(500).json({
      error: "Failed to debug product groups",
    });
  }
};