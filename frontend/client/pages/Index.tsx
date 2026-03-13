import { useEffect, useState } from "react";
import { getProductMeta, getProducts } from "../api/products";
import ProductTable from "../components/products/ProductTable";
import type { Product } from "../types/product";
import { useSocket } from "../hooks/useSocket";
import { useTranslation } from "react-i18next";

export default function Index() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [supermarkets, setSupermarkets] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSupermarket, setSelectedSupermarket] = useState("");
  const { t } = useTranslation();

  /*
  Load product metadata (categories + supermarkets)
  Runs once when the page loads
  */

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const res = await getProductMeta();
        setCategories(res.data.categories);
        setSupermarkets(res.data.supermarkets);
      } catch (error) {
        console.error("Failed to load metadata:", error);
      }
    };

    loadMeta();
  }, []);

  // Reload products whenever filters change

  const loadProducts = async () => {
    try {
      const params: Record<string, string> = {};

      if (selectedCategory) {
        params.category = selectedCategory;
      }

      if (selectedSupermarket) {
        params.supermarket = selectedSupermarket;
      }

      const res = await getProducts(params);
      setProducts(res.data);
    } catch (error) {
      console.error("Failed to load products:", error);
    }
  };

  // Reload products whenever filters change

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, selectedSupermarket]);

  // Listen for real-time price updates*/
  
  useSocket(loadProducts);
  
  return (
    <div style={{ padding: "20px" }}>
      <h1>{t("title")}</h1>

      {/* Filters */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
        <div>
          <label>{t("category")}</label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All categories</option>

            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="supermarket">Supermarket:</label>
          <select
            id="supermarket"
            value={selectedSupermarket}
            onChange={(e) => setSelectedSupermarket(e.target.value)}
          >
            <option value="">All supermarkets</option>

            {supermarkets.map((supermarket) => (
              <option key={supermarket} value={supermarket}>
                {supermarket}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product list */}
      <ProductTable products={products} />
    </div>
  );
}