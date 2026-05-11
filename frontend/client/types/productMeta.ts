export type ProductMetaCategory = {
  id: string;
  name: string;
  slug: string;
};

export type ProductMeta = {
  categories: ProductMetaCategory[];
  supermarkets: string[];
};