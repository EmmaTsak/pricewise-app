import axios from "axios";
import type { Product } from "../types/product";
import type { ProductMeta } from "../types/productMeta";
import { env } from "../config/env";

const API = axios.create({
  baseURL: env.apiBaseUrl,
});

export const getProducts = (params?: Record<string, string | undefined>) => {
  return API.get<Product[]>("/products", { params });
};

export const getProductMeta = () => {
  return API.get<ProductMeta>("/products/meta");
};

export const compareProductPrices = (productKey: string) => {
  return API.get(`/products/compare/${productKey}`);
};

export const sendShoppingListEmail = (email: string, items: unknown[]) => {
  return API.post("/email-list", { email, items });
};