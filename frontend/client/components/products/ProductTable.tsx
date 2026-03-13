import { useState } from "react";
import { compareProductPrices } from "../../api/products";
import type { Product } from "../../types/product";
import { useShoppingList } from "../../context/ShoppingListContext";

type ProductTableProps = {
  products: Product[];
};

export default function ProductTable({ products }: ProductTableProps) {
  const [comparison, setComparison] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
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
      <div style={{ display: "grid", gap: "16px", marginTop: "20px" }}>
        {products.map((product) => (
          <div
            key={product.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              padding: "12px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              background: "#fff"
            }}
          >
            {/* Product Image */}
            <img
              src={product.photoURL}
              alt={product.name}
              style={{
                width: "80px",
                height: "80px",
                objectFit: "cover",
                borderRadius: "6px"
              }}
            />

            {/* Product Info */}
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0 }}>{product.name}</h3>
              <p style={{ margin: "4px 0", color: "#666" }}>
                {product.supermarket}
              </p>
            </div>

            {/* Price */}
            <div style={{ fontWeight: "bold", fontSize: "18px" }}>
              €{product.price}
            </div>

            <button
              onClick={() => addItem(product)}
              style={{
                padding: "6px 12px",
                background: "#16a34a",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              Add to List
            </button>

            {/* Compare Button */}
            <button
              onClick={() => handleCompare(product.productKey)}
              style={{
                padding: "6px 12px",
                background: "#2b6cb0",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              Compare
            </button>
          </div>
        ))}
      </div>

      {/* Comparison Modal */}
      {selectedProduct && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "10px",
              width: "400px"
            }}
          >
            <h2>Price Comparison</h2>

            {comparison.map((item) => (
              <div
                key={item.supermarket}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "10px"
                }}
              >
                <span>{item.supermarket}</span>
                <span>€{item.price}</span>
              </div>
            ))}

            <button
              onClick={() => setSelectedProduct(null)}
              style={{
                marginTop: "10px",
                padding: "6px 12px",
                border: "none",
                background: "#444",
                color: "white",
                borderRadius: "6px"
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}