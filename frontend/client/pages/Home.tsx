import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, Filter, Search } from "lucide-react";

import {
  getProductGroups,
  compareProductGroupPrices,
  getProductMeta,
} from "../api/products";

import type { ProductMeta } from "../types/productMeta";

import { useSocket } from "../hooks/useSocket";

import type {
  ProductGroup,
  ProductGroupComparison,
} from "../types/productGroup";

import ProductGroupCard from "../components/ProductGroupCard";
import ComparisonModal from "../components/ComparisonModal";

export default function Index() {
  const { t } = useTranslation();

  const [search, setSearch] = useState("");

  // Stores the categories and supermarkets from the backend
  const [meta, setMeta] = useState<ProductMeta | null>(null);

  // Stores the selected category filter
  const [selectedCategory, setSelectedCategory] = useState("");

  // Stores the selected supermarket filters
  const [selectedSupermarkets, setSelectedSupermarkets] = useState<string[]>([]);
  const [showCategories, setShowCategories] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [pendingSupermarkets, setPendingSupermarkets] = useState<string[]>([]);

  const hasActiveSearch =
    search.trim().length > 0 ||
    selectedCategory !== "";

  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [selectedComparison, setSelectedComparison] =
    useState<ProductGroupComparison | null>(null);

  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingComparison, setLoadingComparison] = useState(false);

  // Loads categories and supermarkets for the filters
  const loadMeta = async () => {
    try {
      const response = await getProductMeta();
      setMeta(response.data);
    } catch (error) {
      console.error("Failed to load product filters:", error);
    }
  };

  // Loads grouped products using search + filters
  const loadGroups = useCallback(async () => {
    if (!hasActiveSearch) {
      setGroups([]);
      return;
    }
    
    try {
      setLoadingGroups(true);

      const response = await getProductGroups({
        search: search.trim() || undefined,

        category: selectedCategory || undefined,

        supermarkets:
          selectedSupermarkets.length > 0
            ? selectedSupermarkets.join(",")
            : undefined,
      });

      setGroups(response.data);
    } catch (error) {
      console.error("Failed to load product groups:", error);
    } finally {
      setLoadingGroups(false);
    }
  }, [hasActiveSearch, search, selectedCategory, selectedSupermarkets]);

  const openComparison = async (groupId: string) => {
    try {
      setLoadingComparison(true);

      const response = await compareProductGroupPrices(groupId, {
        supermarkets:
          selectedSupermarkets.length > 0
            ? selectedSupermarkets.join(",")
            : undefined,
      });

      setSelectedComparison(response.data);
    } catch (error) {
      console.error("Failed to load comparison:", error);
    } finally {
      setLoadingComparison(false);
    }
  };

  useEffect(() => {
    loadMeta();
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  /*
    When the backend sends a price update through Socket.IO,
    reload the product groups so the homepage stays fresh.
  */
  useSocket(loadGroups);

  return (
    <div className="min-h-full">
      {/* Hero */}
        {!hasActiveSearch && (
          <section className="relative overflow-hidden border-b border-brand-blue-darker/10 bg-gradient-to-br from-white via-brand-cyan/10 to-brand-green/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
              <div className="max-w-3xl">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 leading-relaxed">
                  {t("home.hero.title")}
                  <span className="block bg-gradient-to-r from-brand-green via-brand-cyan to-brand-blue bg-clip-text text-transparent mb-2 pb-3">
                    {t("home.hero.highlight")}
                  </span>
                </h1>

                <p className="text-lg text-gray-600 max-w-2xl">
                  {t("home.hero.subtitle")}
                </p>
              </div>
            </div>
          </section>
        )}

      {/* Search + comparable products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Search card */}
        <div className="bg-gradient-to-r from-brand-green/10 to-brand-green/5 rounded-xl shadow-sm border border-brand-green/20 p-6 mb-8">
          <div className="flex flex-col gap-4">
            {/* Main Search Bar */}
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("home.search.placeholder")}
                className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-12 pr-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-blue-darker focus:border-transparent"
              />
            </div>

            {/* Filter Buttons & Search Info */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                {/* Categories Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCategories((current) => !current);
                      setShowFilters(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-green to-brand-teal text-white font-medium rounded-lg hover:shadow-lg transition-shadow"
                  >
                    <span>
                      {selectedCategory
                        ? t(`categories.${selectedCategory}`, {
                            defaultValue:
                              meta?.categories.find(
                                (category) => category.slug === selectedCategory
                              )?.name ?? t("home.filters.categories"),
                          })
                        : t("home.filters.categories")}
                    </span>

                    <ChevronDown
                      size={16}
                      className={`transition-transform ${
                        showCategories ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Categories Dropdown */}
                  {showCategories && (
                    <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-20 min-w-max overflow-hidden">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategory("");
                          setShowCategories(false);
                        }}
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors border-b border-gray-200"
                      >
                        {t("home.filters.allCategories")}
                      </button>

                      {meta?.categories.map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(category.slug);
                            setShowCategories(false);
                          }}
                          className={`w-full px-4 py-2 text-left transition-colors ${
                            selectedCategory === category.slug
                              ? "bg-brand-blue-darker/10 text-brand-blue-darker font-medium"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {t(`categories.${category.slug}`, {
                            defaultValue: category.name,
                          })}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Stores */}
                <button
                  type="button"
                  onClick={() => {
                    setShowFilters((current) => !current);
                    setShowCategories(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-green to-brand-teal text-white font-medium rounded-lg hover:shadow-lg transition-shadow"
                >
                  <Filter size={18} />
                  {t("home.filters.stores")}
                  {selectedSupermarkets.length > 0 && (
                    <span className="text-sm">
                      ({selectedSupermarkets.length})
                    </span>
                  )}
                </button>
              </div>

              {search.trim() && (
                <span className="text-sm text-gray-600">
                  {t("home.search.searchingFor")}{" "}
                  <span className="font-semibold text-gray-900">
                    "{search}"
                  </span>
                </span>
              )}
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="pt-4 border-t border-gray-200">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {t("home.filters.stores")}
                  </label>

                  <div className="space-y-2">
                    {meta?.supermarkets.map((supermarket) => (
                      <div key={supermarket} className="flex items-center">
                        <input
                          type="checkbox"
                          id={supermarket}
                          checked={pendingSupermarkets.includes(supermarket)}
                          onChange={() => {
                            setPendingSupermarkets((current) =>
                              current.includes(supermarket)
                                ? current.filter((item) => item !== supermarket)
                                : [...current, supermarket]
                            );
                          }}
                          className="w-4 h-4 bg-white border border-gray-300 rounded cursor-pointer focus:ring-2 focus:ring-brand-blue-darker accent-brand-blue-darker"
                        />

                        <label
                          htmlFor={supermarket}
                          className="ml-2 text-sm text-gray-700 cursor-pointer"
                        >
                          {t(`stores.${supermarket}`, {
                            defaultValue: supermarket,
                          })}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSupermarkets(pendingSupermarkets);
                      setShowFilters(false);
                    }}
                    className="flex-1 px-4 py-2 gap-2 px-4 py-2 bg-gradient-to-r from-brand-green to-brand-teal text-white font-medium rounded-lg hover:shadow-lg transition-shadow"
                  >
                    {t("home.filters.apply")}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPendingSupermarkets([]);
                      setSelectedSupermarkets([]);
                      setShowFilters(false);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors bg-white"
                  >
                    {t("home.filters.clear")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product groups */}
        {hasActiveSearch && (
          <>
            {loadingGroups ? (
              <div className="bg-white border border-brand-blue-darker/10 rounded-3xl shadow-sm p-8 text-center text-gray-600">
                {t("home.states.loadingComparable")}
              </div>
            ) : groups.length === 0 ? (
              <div className="bg-white border border-brand-blue-darker/10 rounded-3xl shadow-sm p-8 text-center text-gray-600">
                {t("home.states.noComparable")}
              </div>
            ) : (
              <>
                <div className="mb-5 text-sm text-gray-600">
                  {t("home.results.showing", { count: groups.length })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {groups.map((group) => (
                    <ProductGroupCard
                      key={group.id}
                      group={group}
                      onClick={openComparison}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </section>

      {/* Loading comparison overlay */}
      {loadingComparison && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 shadow-xl text-gray-700">
            {t("home.compare.loading")}
          </div>
        </div>
      )}

      {/* Comparison modal */}
      <ComparisonModal
        comparison={selectedComparison}
        onClose={() => setSelectedComparison(null)}
      />
    </div>
  );
}