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
export const getProductMeta = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.product.findMany({
      select: {
        categoryName: true,
      },
      distinct: ["categoryName"],
    });

    const supermarkets = await prisma.product.findMany({
      select: {
        supermarket: true,
      },
      distinct: ["supermarket"],
    });

    res.json({
      categories: categories
        .map((c: { categoryName: string | null }) => c.categoryName)
        .filter(Boolean),

      supermarkets: supermarkets.map((s: { supermarket: string }) => s.supermarket),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to fetch metadata",
    });
  }
};

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
    const { search, category } = req.query;

    const groups = await prisma.productGroup.findMany({
      where: {
        // Search by group name, for example "coca"
        name: search
          ? {
              contains: String(search),
              mode: "insensitive",
            }
          : undefined,

        // Optional category filter, for example "soft-drinks"
        category: category
          ? {
              slug: String(category),
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
          },
          orderBy: {
            price: "asc",
          },
        },
      },
      orderBy: {
        name: "asc",
      },
      take: 100,
    });

    /*
      We only want groups that are useful for comparison.

      A group is useful if it has products from at least
      2 different supermarkets.
    */
    const comparableGroups = groups
      .map(
        (group: {
          id: string | number;
          name: string;
          size: number;
          imageUrl: string | null;
          category: {
            id: string | number;
            name: string;
            slug: string;
          };
          products: {
            supermarket: string;
            price: number;
          }[];
        }) => {
          const supermarkets = new Set(
            group.products.map((product) => product.supermarket)
          );

          return {
            id: group.id,
            name: group.name,
            size: group.size,
            imageUrl: group.imageUrl,
            category: {
              id: group.category.id,
              name: group.category.name,
              slug: group.category.slug,
            },
            lowestPrice: group.products[0]?.price ?? null,
            supermarketCount: supermarkets.size,
          };
        }
      )
      .filter((group: { supermarketCount: number }) => group.supermarketCount >= 2);

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

    const group = await prisma.productGroup.findUnique({
      where: {
        id: groupId,
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