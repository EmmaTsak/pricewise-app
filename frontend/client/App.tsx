import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ShoppingList from "./pages/ShoppingList";
import CompareGroups from "./pages/CompareGroups";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import { ShoppingListProvider } from "./context/ShoppingListContext";
import { ToastProvider } from "./context/ToastContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ShoppingListProvider>
        <ToastProvider>
          <BrowserRouter>
            <div className="flex flex-col min-h-screen bg-white">
              <Navbar />

              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/compare-groups" element={<CompareGroups />} />
                  <Route path="/shopping-list" element={<ShoppingList />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>

              <Footer />
            </div>
          </BrowserRouter>
        </ToastProvider>
      </ShoppingListProvider>
    </QueryClientProvider>
  );
}