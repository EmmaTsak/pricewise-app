import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, Store, Tags } from "lucide-react";
import ProductTable from "../components/ProductTable";
import { getProductMeta, getProducts } from "../api/products";
import { useSocket } from "../hooks/useSocket";
import type { Product } from "../types/product";

export default function Index() {
  const { t } = useTranslation();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [supermarkets, setSupermarkets] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSupermarket, setSelectedSupermarket] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeta();
  }, []);

  const fetchMeta = async () => {
    try {
      const res = await getProductMeta();
      setCategories(res.data.categories || []);
      setSupermarkets(res.data.supermarkets || []);
    } catch (error) {
      console.error("Failed to load metadata:", error);
    }
  };

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);

      const res = await getProducts({
        category: selectedCategory || undefined,
        supermarket: selectedSupermarket || undefined,
      });

      setProducts(res.data || []);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedSupermarket]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useSocket(fetchProducts);

  return (
    <div className="min-h-full">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-brand-blue-darker/10 bg-gradient-to-br from-white via-brand-cyan/10 to-brand-green/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center rounded-full border border-brand-blue-darker/10 bg-white/80 px-4 py-2 text-sm text-brand-blue-darker shadow-sm mb-5">
              {t("home.badge")}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-5 bg-gradient-to-r from-brand-blue-darker via-brand-blue-dark to-brand-teal bg-clip-text text-transparent">
              {t("home.title")}
            </h1>

            <p className="text-lg md:text-xl text-gray-700 leading-8 max-w-2xl">
              {t("home.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Filters + products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filter card */}
        <div className="bg-white border border-brand-blue-darker/10 rounded-3xl shadow-sm p-6 md:p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-green to-brand-teal flex items-center justify-center">
              <Search size={20} className="text-white" />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {t("home.filters.title")}
              </h2>
              <p className="text-sm text-gray-600">
                {t("home.filters.subtitle")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Supermarket filter */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2 text-gray-700">
                <Store size={16} className="text-brand-blue-darker" />
                {t("home.filters.supermarket")}
              </label>

              <select
                value={selectedSupermarket}
                onChange={(e) => setSelectedSupermarket(e.target.value)}
                className="w-full rounded-xl border border-brand-blue-darker/10 bg-white px-4 py-3 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
              >
                <option value="">{t("home.filters.allSupermarkets")}</option>
                {supermarkets.map((supermarket) => (
                  <option key={supermarket} value={supermarket}>
                    {supermarket}
                  </option>
                ))}
              </select>
            </div>

            {/* Category filter */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2 text-gray-700">
                <Tags size={16} className="text-brand-blue-darker" />
                {t("home.filters.category")}
              </label>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-xl border border-brand-blue-darker/10 bg-white px-4 py-3 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
              >
                <option value="">{t("home.filters.allCategories")}</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* State / products */}
        {loading ? (
          <div className="bg-white border border-brand-blue-darker/10 rounded-3xl shadow-sm p-8 text-center text-gray-600">
            {t("home.states.loading")}
          </div>
        ) : (
          <ProductTable products={products} />
        )}
      </section>
    </div>
  );
}