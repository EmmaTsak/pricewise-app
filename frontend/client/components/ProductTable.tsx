import { useState } from "react";
import { compareProductPrices } from "../api/products";
import type { Product } from "../types/product";
import { useShoppingList } from "../context/ShoppingListContext";
import ProductCard from "./ProductCard";

type ProductTableProps = {
  products: Product[];
};

export default function ProductTable({ products }: ProductTableProps) {
  const [comparison, setComparison] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const { addItem } = useShoppingList();
  
  const handleCompare = async (productKey: string) => {
    try {
      const res = await compareProductPrices(productKey);
      setComparison(res.data);
      setSelectedProduct(productKey);
    } catch (error) {
      console.error("Failed to load comparison:", error);
    }
  };

  if (products.length === 0) {
    return <p>No products found.</p>;
  }

  return (
    <>
      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onCompare={handleCompare}
          />
        ))}
      </div>

      {/* Comparison Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

          <div className="bg-white rounded-xl shadow-lg w-96 p-6">

            <h2 className="text-lg font-semibold mb-4">
              Price Comparison
            </h2>

            <div className="flex flex-col gap-3">

              {comparison.map((item, index) => (
                <div
                  key={item.supermarket}
                  className={`flex justify-between p-3 rounded ${
                    index === 0
                      ? "bg-green-100 font-semibold"
                      : "bg-gray-50"
                  }`}
                >
                  <span>{item.supermarket}</span>
                  <span>€{item.price}</span>
                </div>
              ))}

            </div>

            <button
              onClick={() => setOpen(false)}
              className="mt-5 w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-900"
            >
              Close
            </button>

          </div>

        </div>
      )}
    </>
  );
}