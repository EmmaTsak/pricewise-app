import { createContext, useContext, useEffect, useState } from "react";
import type { Product } from "../types/product";

type ShoppingListContextType = {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
};

const ShoppingListContext = createContext<ShoppingListContextType | undefined>(undefined);

export const ShoppingListProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<Product[]>([]);

  // Load from localStorage when app starts
  useEffect(() => {
    const stored = localStorage.getItem("shopping-list");

    if (stored) {
      setItems(JSON.parse(stored));
    }
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem("shopping-list", JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product) => {
    setItems((prev) => {
      if (prev.find((p) => p.id === product.id)) {
        return prev;
      }

      return [...prev, product];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <ShoppingListContext.Provider value={{ items, addItem, removeItem }}>
      {children}
    </ShoppingListContext.Provider>
  );
};

export const useShoppingList = () => {
  const context = useContext(ShoppingListContext);

  if (!context) {
    throw new Error("useShoppingList must be used inside ShoppingListProvider");
  }

  return context;
};