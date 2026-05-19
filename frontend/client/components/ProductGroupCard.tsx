import { useTranslation } from "react-i18next";
import type { ProductGroup } from "../types/productGroup";
import ProductImage from "./ProductImage";

type ProductGroupCardProps = {
  group: ProductGroup;
  onClick: (groupId: string) => void;
};

export default function ProductGroupCard({
  group,
  onClick,
}: ProductGroupCardProps) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={() => onClick(group.id)}
      className="text-left bg-white rounded-xl shadow hover:shadow-lg transition p-4 flex flex-col gap-3"
    >
      <ProductImage
        src={group.imageUrl}
        fallbackSources={group.productImages}
        alt={group.name}
        className="h-32 w-full rounded-lg bg-gray-50"
        imgClassName="h-32 w-full rounded-lg bg-gray-50 object-contain"
      />
      <div>
        <h3 className="font-semibold text-gray-800 line-clamp-2">
          {group.name}
        </h3>

        <p className="text-sm text-gray-500 mt-1">
          {t(`categories.${group.category.slug}`, {
            defaultValue: group.category.name,
          })}
        </p>
      </div>

      <div className="mt-auto">
        {group.lowestPrice !== null && (
          <p className="text-lg font-bold text-green-600">
            {t("productGroupCard.fromPrice", {
              price: Number(group.lowestPrice).toFixed(2),
            })}
          </p>
        )}

        <p className="text-sm text-gray-500">
          {t("productGroupCard.availableIn", {
            count: group.supermarketCount,
          })}
        </p>
      </div>
    </button>
  );
}