import { useState } from "react";
import { useShoppingList } from "../context/ShoppingListContext";
import { sendShoppingListEmail } from "../api/products";

export default function ShoppingList() {
  const { items, removeItem } = useShoppingList();
  const [email, setEmail] = useState("");

  const handleSendEmail = async () => {
    try {
      await sendShoppingListEmail(email, items);
      alert("Shopping list sent!");
    } catch (error) {
      alert("Failed to send email");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">

      {/* Page Title */}
      <h1 className="text-2xl font-bold mb-6">
        Your Shopping List
      </h1>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="text-gray-500">
          Your shopping list is empty.
        </div>
      )}

      {/* Items */}
      <div className="flex flex-col gap-4">

        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between bg-white shadow rounded-lg p-4"
          >

            {/* Left section */}
            <div className="flex items-center gap-4">

              <img
                src={item.photoURL}
                alt={item.name}
                className="h-16 w-16 object-contain"
              />

              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-gray-500">
                  {item.supermarket}
                </div>
              </div>

            </div>

            {/* Right section */}
            <div className="flex items-center gap-4">

              <span className="font-semibold text-green-600">
                €{item.price}
              </span>

              <button
                onClick={() => removeItem(item.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Remove
              </button>

            </div>

          </div>
        ))}

      </div>

      {/* Email section */}
      {items.length > 0 && (
        <div className="mt-8 bg-white shadow rounded-lg p-6">

          <h2 className="text-lg font-semibold mb-4">
            Email your list
          </h2>

          <div className="flex gap-3">

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border rounded px-3 py-2 flex-1"
            />

            <button
              onClick={handleSendEmail}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Send
            </button>

          </div>

        </div>
      )}

    </div>
  );
}