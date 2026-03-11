import express from "express";
import cors from "cors";
import helmet from "helmet";

// Create an Express application
const app = express();

// Enable security headers
app.use(helmet());

// Allow requests from the frontend
app.use(cors());

// Allow the server to read JSON data from requests
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "PriceWise API is running"
  });
});

import prisma from "./config/prisma";

app.get("/products", async (req, res) => {
  const products = await prisma.product.findMany();

  res.json(products);
});

export default app;