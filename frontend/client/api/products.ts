import axios from "axios";
import type { Product } from "../types/product";
import type { ProductMeta } from "../types/productMeta";

const API = axios.create({
  baseURL: "http://localhost:5000"
});

export const getProducts = (params?: any) => {
  return API.get<Product[]>("/products", { params });
};

export const getProductMeta = () => {
  return API.get<ProductMeta>("/products/meta");
};

export const compareProductPrices = (productKey: string) => {
  return API.get(`/products/compare/${productKey}`);
};

export const sendShoppingListEmail = (email: string, items: any[]) => {
  return API.post("/email-list", { email, items });
};