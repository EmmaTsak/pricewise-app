import { ShoppingCart, X } from "lucide-react";
import type { ProductGroupComparison } from "../types/productGroup";
import { useShoppingList } from "../context/ShoppingListContext";

type ComparisonModalProps = {
  comparison: ProductGroupComparison | null;
  onClose: () => void;
};

export default function ComparisonModal({
  comparison,
  onClose,
}: ComparisonModalProps) {
  const { addItem, items } = useShoppingList();

  if (!comparison) {
    return null;
  }

  const bestPrice =
    comparison.products.length > 0
      ? Number(comparison.products[0].price)
      : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-start justify-between gap-4 p-5 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {comparison.name}
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Compared across {comparison.supermarketCount} supermarkets
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full border flex items-center justify-center hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto max-h-[70vh]">
          <div className="space-y-4">
            {comparison.products.map((product) => {
              const price = Number(product.price);
              const isBestPrice = bestPrice !== null && price === bestPrice;

              return (
                <div
                  key={product.id}
                  className={`border rounded-xl p-4 ${
                    isBestPrice
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {product.supermarket}
                        </h3>

                        {isBestPrice && (
                          <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                            Best price
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-500 mt-1">
                        {product.name}
                      </p>

                      {product.url && (
                        <a
                          href={product.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                        >
                          View product
                        </a>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <p className="text-2xl font-bold text-green-600">
                        €{product.price}
                      </p>

                      <button
                        type="button"
                        onClick={() => addItem(product)}
                        disabled={items.some((item) => item.id === product.id)}
                        className="inline-flex items-center gap-2 rounded-xl bg-brand-blue-darker px-3 py-2 text-sm font-medium text-white hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:bg-gray-300"
                      >
                        <ShoppingCart size={16} />

                        {items.some((item) => item.id === product.id)
                          ? "Added"
                          : "Add to list"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}