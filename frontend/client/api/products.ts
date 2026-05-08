import axios from "axios";
import type { Product } from "../types/product";
import type { ProductMeta } from "../types/productMeta";
import type {
  ProductGroup,
  ProductGroupComparison,
} from "../types/productGroup";
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

// Old endpoint. We will stop using this for real comparison.
export const compareProductPrices = (productKey: string) => {
  return API.get(`/products/compare/${productKey}`);
};

// New group-based comparison endpoints.
export const getProductGroups = (params?: {
  search?: string;
  category?: string;
}) => {
  return API.get<ProductGroup[]>("/products/groups", { params });
};

export const compareProductGroupPrices = (groupId: string) => {
  return API.get<ProductGroupComparison>(
    `/products/groups/${groupId}/compare`
  );
};

export const sendShoppingListEmail = (email: string, items: unknown[]) => {
  return API.post("/email-list", { email, items });
};