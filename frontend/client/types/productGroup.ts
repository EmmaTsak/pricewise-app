import type { Product } from "./product";

export type ProductGroup = {
  id: string;
  name: string;
  size?: string | null;
  imageUrl?: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  lowestPrice: number | string | null;
  supermarketCount: number;
  supermarkets: string[];
};

export type ProductGroupComparison = {
  id: string;
  name: string;
  size?: string | null;
  imageUrl?: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  brand?: string | null;
  supermarketCount: number;
  products: Product[];
};