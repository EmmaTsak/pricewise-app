import { Store } from "lucide-react";
import type { ProductGroup } from "../types/productGroup";

type ProductGroupCardProps = {
  group: ProductGroup;
  onClick: (groupId: string) => void;
};

export default function ProductGroupCard({
  group,
  onClick,
}: ProductGroupCardProps) {
  return (
    <button
      onClick={() => onClick(group.id)}
      className="text-left bg-white rounded-xl shadow hover:shadow-lg transition p-4 flex flex-col gap-3"
    >
      <div className="h-32 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
        {group.imageUrl ? (
          <img
            src={group.imageUrl}
            alt={group.name}
            className="h-full w-full object-contain"
          />
        ) : (
          <Store className="text-gray-400" size={36} />
        )}
      </div>

      <div>
        <h3 className="font-semibold text-gray-800 line-clamp-2">
          {group.name}
        </h3>

        <p className="text-sm text-gray-500 mt-1">
          {group.category.name}
        </p>
      </div>

      <div className="mt-auto">
        {group.lowestPrice !== null && (
          <p className="text-lg font-bold text-green-600">
            From €{group.lowestPrice}
          </p>
        )}

        <p className="text-sm text-gray-500">
          Available in {group.supermarketCount} supermarkets
        </p>
      </div>
    </button>
  );
}