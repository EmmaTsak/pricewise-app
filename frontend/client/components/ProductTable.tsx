import { useState } from "react";
import { useTranslation } from "react-i18next";
import { X, BadgeEuro } from "lucide-react";
import { compareProductPrices } from "../api/products";
import type { Product } from "../types/product";
import ProductCard from "./ProductCard";

type ProductTableProps = {
  products: Product[];
};

export default function ProductTable({ products }: ProductTableProps) {
  const { t } = useTranslation();
  const [comparison, setComparison] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);

  const handleCompare = async (productKey: string) => {
    try {
      const res = await compareProductPrices(productKey);
      setComparison(res.data);
      setOpen(true);
    } catch (error) {
      console.error(t("home.compare.failed"), error);
    }
  };

  if (products.length === 0) {
    return (
      <div className="bg-white border border-brand-blue-darker/10 rounded-3xl shadow-sm p-8 text-center text-gray-600">
        {t("home.states.empty")}
      </div>
    );
  }

  const bestPrice = comparison.length > 0 ? comparison[0].price : null;
  const productName = comparison.length > 0 ? comparison[0].name : "";

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onCompare={handleCompare}
          />
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-brand-blue-darker/10 overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 p-6 border-b border-brand-blue-darker/10 bg-gradient-to-r from-white via-brand-cyan/10 to-brand-green/10">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white border border-brand-blue-darker/10 px-3 py-1 text-xs font-medium text-brand-blue-darker shadow-sm mb-3">
                  <BadgeEuro size={14} />
                  {t("home.compare.title")}
                </div>

                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                  {productName || t("home.compare.title")}
                </h2>

                <p className="text-sm text-gray-600 mt-1">
                  {t("home.compare.subtitle")}
                </p>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-brand-blue-darker/10 bg-white text-brand-blue-darker hover:bg-brand-blue-darker/5 transition-colors"
                aria-label={t("home.compare.close")}
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="space-y-4">
                {comparison.map((item, index) => {
                  const isBest = item.price === bestPrice;

                  return (
                    <div
                      key={`${item.supermarket}-${index}`}
                      className={`rounded-2xl border p-4 transition-all ${
                        isBest
                          ? "border-brand-green bg-gradient-to-r from-brand-green/10 to-brand-teal/10 shadow-sm"
                          : "border-brand-blue-darker/10 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">
                              {item.supermarket}
                            </h3>

                            {isBest && (
                              <span className="inline-flex items-center rounded-full bg-brand-green text-white px-2.5 py-1 text-xs font-semibold">
                                {t("home.compare.bestDeal")}
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-gray-500">
                            {t("home.compare.availablePrice")}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-bold text-brand-blue-darker">
                            €{item.price}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setOpen(false)}
                className="mt-6 w-full rounded-2xl bg-brand-blue-darker text-white py-3 font-medium hover:bg-brand-blue-dark transition-colors"
              >
                {t("home.compare.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}