import { useShoppingList } from "../context/ShoppingListContext";
import { useState } from "react";
import { sendShoppingListEmail } from "../api/products";

export default function ShoppingList() {
  const { items, removeItem } = useShoppingList();
  const [email, setEmail] = useState("");
  const handleSendEmail = async () => {
    try {
      await sendShoppingListEmail(email, items);
      alert("Shopping list sent!");
    } catch (error) {
      console.error(error);
      alert("Failed to send email");
    }
  };
  
  if (items.length === 0) {
    return <p>Your shopping list is empty.</p>;
  }

  return (
    <div>
      <h1>Your Shopping List</h1>

      {items.map((item) => (
        <div
          key={item.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "10px",
            borderBottom: "1px solid #ddd"
          }}
        >
          <span>{item.name}</span>
          <button onClick={() => removeItem(item.id)}>Remove</button>
        </div>
      ))}
      <div style={{ marginTop: "20px" }}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: "6px", marginRight: "10px" }}
        />

        <button onClick={handleSendEmail}>
          Email my list
        </button>
      </div>
    </div>
  );
}