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
  supermarketCount: number;
  products: Product[];
};