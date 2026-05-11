export type Product = {
  id: string;
  name: string;
  brand?: string | null;
  productKey: string;
  price: number | string;
  supermarket: string;
  categoryName?: string | null;
  photoURL?: string | null;
  url?: string | null;
  updatedAt: string;
};