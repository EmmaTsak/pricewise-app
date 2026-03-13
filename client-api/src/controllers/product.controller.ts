import { Request, Response } from "express";
import prisma from "../config/prisma";
import { getIO } from "../sockets/socket";

/*
GET /products
Optional filters:
?supermarket=Lidl
?category=Dairy
*/

export const getProducts = async (req: Request, res: Response) => {
    try {
        const { supermarket, category } = req.query;

        // Build filtering object
        const filters: any = {};

        if (supermarket) {
            filters.supermarket = String(supermarket);
        }

        if (category) {
            filters.category = String(category);
        }

        // Fetch products from database
        const products = await prisma.product.findMany({
            where: filters,
            orderBy: {
                updatedAt: "desc"
            }
        });

        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch products" });
    }   
};

/*
GET /products/compare/:productKey
Compare prices of the same product across supermarkets
*/

export const compareProductPrices = async (req: Request, res: Response) => {
    try {
        const { productKey } = req.params;

        const products = await prisma.product.findMany({
            where: {
                productKey: productKey
            },
            select: {
                supermarket: true,
                price: true,
                name: true,
                photoURL: true,
            },
            orderBy: {
                price: "asc"
            }
        });

        if (products.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.json(products);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to compare product prices" });
    }
};

// Get /product/meta
export const getProductMeta = async (req: Request, res: Response) => {
  try {

    const categories = await prisma.product.findMany({
        select: { category: true },
        distinct: ["category"]
    });

    const supermarkets = await prisma.product.findMany({
        select: { supermarket: true },
        distinct: ["supermarket"]
    });

    res.json({
        categories: categories.map((c: { category: string }) => c.category),
        supermarkets: supermarkets.map((s: { supermarket: string }) => s.supermarket)
    });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to fetch metadata"
        });
    }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      name,
      brand,
      productKey,
      price,
      supermarket,
      category,
      photoURL,
      url
    } = req.body;

    // Basic validation
    if (!name || !productKey || !price || !supermarket || !category || !photoURL) {
      return res.status(400).json({
        error: "Missing required fields"
      });
    }

    const product = await prisma.product.upsert({
        where: {
            productKey_supermarket: {
            productKey,
            supermarket
        }
        },
        update: {
            name,
            brand,
            price,
            category,
            photoURL,
            url
        },
        create: {
            name,
            brand,
            productKey,
            price,
            supermarket,
            category,
            photoURL,
            url
        }
    });

    // notify frontend about price change
    getIO().emit("price-updated", product);

    res.status(201).json(product);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to create product"
    });
  }
};