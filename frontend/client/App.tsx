import "./global.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ShoppingList from "./pages/ShoppingList";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import { ShoppingListProvider } from "./context/ShoppingListContext";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ShoppingListProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/shopping-list" element={<ShoppingList />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ShoppingListProvider>
    </QueryClientProvider>
  );
}