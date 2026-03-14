import { useEffect, useState } from "react";
import { getProductMeta, getProducts } from "../api/products";
import ProductTable from "../components/ProductTable";
import type { Product } from "../types/product";
import { useSocket } from "../hooks/useSocket";
import { useTranslation } from "react-i18next";

export default function Index() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [supermarkets, setSupermarkets] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSupermarket, setSelectedSupermarket] = useState("");
  const [search, setSearch] = useState("");
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
    <div className="max-w-6xl mx-auto px-6 py-8">

      {/* Hero Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          PriceWise
        </h1>

        <p className="text-gray-500 mt-2">
          Compare grocery prices across supermarkets
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-xl p-4 mb-8 flex flex-wrap gap-4">

        {/* Search */}
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 flex-1 min-w-[200px]"
        />

        {/* Category */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="">All categories</option>

          {categories.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>

        {/* Supermarket */}
        <select
          value={selectedSupermarket}
          onChange={(e) => setSelectedSupermarket(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="">All supermarkets</option>

          {supermarkets.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

      </div>

      {/* Product Grid */}
      <ProductTable
        products={products.filter((p) =>
          p.name.toLowerCase().includes(search.toLowerCase())
        )}
      />

    </div>
  );
}