import type { Product } from "../types/product";
import { useShoppingList } from "../context/ShoppingListContext";

type ProductCardProps = {
  product: Product;
  onCompare: (productKey: string) => void;
};

export default function ProductCard({ product, onCompare }: ProductCardProps) {
  const { addItem } = useShoppingList();

  return (
    <div className="bg-white rounded-xl shadow hover:shadow-lg transition p-4 flex flex-col gap-3">

      <img
        src={product.photoURL}
        alt={product.name}
        className="h-32 object-contain"
      />

      <h3 className="font-semibold text-gray-800">{product.name}</h3>

      <span className="text-sm text-gray-500">
        {product.supermarket}
      </span>

      <strong className="text-lg text-green-600">
        €{product.price}
      </strong>

      <div className="flex gap-2 mt-2">

        <button
          onClick={() => onCompare(product.productKey)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
        >
          Compare
        </button>

        <button
          onClick={() => addItem(product)}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded"
        >
          Add
        </button>

      </div>

    </div>
  );
}