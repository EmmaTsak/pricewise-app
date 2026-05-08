import { ShoppingCart, ArrowRightLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Product } from "../types/product";
import { useShoppingList } from "../context/ShoppingListContext";
import ProductImage from "./ProductImage";

type ProductCardProps = {
  product: Product;
  onCompare: (productKey: string) => void;
};

export default function ProductCard({
  product,
  onCompare,
}: ProductCardProps) {
  const { t } = useTranslation();
  const { addItem } = useShoppingList();

  const handleAddToList = () => {
    addItem(product);
  };

  return (
    <div className="group bg-white border border-brand-blue-darker/10 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Image area */}
      <div className="relative bg-gradient-to-br from-white to-brand-cyan/10 p-6 h-52 flex items-center justify-center">
        <ProductImage
          src={product.photoURL}
          alt={product.name}
          className="w-full h-full"
          imgClassName="max-h-36 object-contain transition-transform duration-300 group-hover:scale-105"
        />

        <div className="absolute top-4 left-4">
          <span className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-brand-blue-darker/10 bg-white text-brand-blue-darker px-4 py-3 text-sm sm:text-base font-medium hover:bg-brand-blue-darker/5 transition-colors">
            {product.supermarket}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 leading-6 line-clamp-2 min-h-[3rem]">
            {product.name}
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            {product.categoryName || "Uncategorized"}
          </p>
        </div>

        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
              {t("product.price")}
            </p>
            <p className="text-2xl font-bold text-brand-blue-darker">
              €{product.price}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleAddToList}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-brand-blue-darker/10 bg-white text-brand-blue-darker px-4 py-3 text-sm sm:text-base font-medium hover:bg-brand-blue-darker/5 transition-colors"
          >
            <ShoppingCart size={18} />
            <span>{t("product.addToList")}</span>
          </button>

          <button
            onClick={() => onCompare(product.productKey)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-brand-blue-darker/10 bg-white text-brand-blue-darker px-4 py-3 font-medium hover:bg-brand-blue-darker/5 transition-colors"
          >
            <ArrowRightLeft size={18} />
            <span>{t("product.compare")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}