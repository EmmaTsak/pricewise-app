export type Product = {
  id: string;
  name: string;
  brand?: string;
  productKey: string;
  price: number;
  supermarket: string;
  categoryName?: string | null;
  photoURL: string;
  url?: string;
  updatedAt: string;
};