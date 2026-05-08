import { useEffect, useState } from "react";
import { Search, X, BadgeEuro, Store } from "lucide-react";
import {
  compareProductGroupPrices,
  getProductGroups,
} from "../api/products";
import type {
  ProductGroup,
  ProductGroupComparison,
} from "../types/productGroup";

export default function CompareGroups() {
  const [search, setSearch] = useState("");
  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [selectedComparison, setSelectedComparison] =
    useState<ProductGroupComparison | null>(null);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingComparison, setLoadingComparison] = useState(false);

  const fetchGroups = async () => {
    try {
      setLoadingGroups(true);

      const res = await getProductGroups({
        search: search || undefined,
      });

      setGroups(res.data);
    } catch (error) {
      console.error("Failed to load product groups:", error);
    } finally {
      setLoadingGroups(false);
    }
  };

  const openComparison = async (groupId: string) => {
    try {
      setLoadingComparison(true);

      const res = await compareProductGroupPrices(groupId);

      setSelectedComparison(res.data);
    } catch (error) {
      console.error("Failed to load group comparison:", error);
    } finally {
      setLoadingComparison(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const bestPrice =
    selectedComparison?.products.length
      ? Number(selectedComparison.products[0].price)
      : null;

  return (
    <div className="min-h-full">
      <section className="relative overflow-hidden border-b border-brand-blue-darker/10 bg-gradient-to-br from-white via-brand-cyan/10 to-brand-green/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center rounded-full border border-brand-blue-darker/10 bg-white/80 px-4 py-2 text-sm text-brand-blue-darker shadow-sm mb-5">
              Product group comparison
            </div>

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-5 bg-gradient-to-r from-brand-blue-darker via-brand-blue-dark to-brand-teal bg-clip-text text-transparent">
              Compare the same product across stores
            </h1>

            <p className="text-lg md:text-xl text-gray-700 leading-8 max-w-2xl">
              Search for a product group, then compare the cheapest matching
              product from each supermarket.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white border border-brand-blue-darker/10 rounded-3xl shadow-sm p-6 md:p-8 mb-8">
          <label className="flex items-center gap-2 text-sm font-medium mb-2 text-gray-700">
            <Search size={16} className="text-brand-blue-darker" />
            Search product groups
          </label>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Example: coca cola"
              className="flex-1 rounded-xl border border-brand-blue-darker/10 bg-white px-4 py-3 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
            />

            <button
              onClick={fetchGroups}
              className="rounded-xl bg-brand-blue-darker text-white px-6 py-3 font-medium hover:bg-brand-blue-dark transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {loadingGroups ? (
          <div className="bg-white border border-brand-blue-darker/10 rounded-3xl shadow-sm p-8 text-center text-gray-600">
            Loading comparable products...
          </div>
        ) : groups.length === 0 ? (
          <div className="bg-white border border-brand-blue-darker/10 rounded-3xl shadow-sm p-8 text-center text-gray-600">
            No comparable product groups found yet. Run the grouping script
            after scraping products.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {groups.map((group) => (
              <button
                key={group.id}
                onClick={() => openComparison(group.id)}
                className="text-left bg-white border border-brand-blue-darker/10 rounded-3xl shadow-sm p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                    {group.imageUrl ? (
                      <img
                        src={group.imageUrl}
                        alt={group.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Store className="text-gray-400" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h2 className="font-semibold text-gray-900 line-clamp-2">
                      {group.name}
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      {group.category.name}
                    </p>

                    <p className="text-sm text-gray-600 mt-2">
                      Available in {group.supermarketCount} supermarkets
                    </p>

                    {group.lowestPrice !== null && (
                      <p className="text-lg font-bold text-brand-blue-darker mt-2">
                        From €{group.lowestPrice}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {loadingComparison && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 shadow-2xl">
            Loading comparison...
          </div>
        </div>
      )}

      {selectedComparison && !loadingComparison && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-brand-blue-darker/10 overflow-hidden">
            <div className="flex items-start justify-between gap-4 p-6 border-b border-brand-blue-darker/10 bg-gradient-to-r from-white via-brand-cyan/10 to-brand-green/10">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white border border-brand-blue-darker/10 px-3 py-1 text-xs font-medium text-brand-blue-darker shadow-sm mb-3">
                  <BadgeEuro size={14} />
                  Price comparison
                </div>

                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                  {selectedComparison.name}
                </h2>

                <p className="text-sm text-gray-600 mt-1">
                  {selectedComparison.supermarketCount} supermarkets compared
                </p>
              </div>

              <button
                onClick={() => setSelectedComparison(null)}
                className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-brand-blue-darker/10 bg-white text-brand-blue-darker hover:bg-brand-blue-darker/5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[65vh]">
              <div className="space-y-4">
                {selectedComparison.products.map((product) => {
                  const price = Number(product.price);
                  const isBest = bestPrice !== null && price === bestPrice;

                  return (
                    <div
                      key={product.id}
                      className={`rounded-2xl border p-4 ${
                        isBest
                          ? "border-brand-green bg-gradient-to-r from-brand-green/10 to-brand-teal/10 shadow-sm"
                          : "border-brand-blue-darker/10 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">
                              {product.supermarket}
                            </h3>

                            {isBest && (
                              <span className="inline-flex items-center rounded-full bg-brand-green text-white px-2.5 py-1 text-xs font-semibold">
                                Best Deal
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-gray-500">
                            {product.name}
                          </p>
                        </div>

                        <p className="text-2xl font-bold text-brand-blue-darker">
                          €{product.price}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setSelectedComparison(null)}
                className="mt-6 w-full rounded-2xl bg-brand-blue-darker text-white py-3 font-medium hover:bg-brand-blue-dark transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}