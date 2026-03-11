import { Request, Response } from "express";
import prisma from "../config/prisma";

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