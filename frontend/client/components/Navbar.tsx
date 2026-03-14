import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useShoppingList } from "../context/ShoppingListContext";

export default function Navbar() {
  const { i18n } = useTranslation();
  const { items } = useShoppingList();

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <Link
          to="/"
          className="text-xl font-bold text-blue-600"
        >
          PriceWise
        </Link>

        {/* Right Section */}
        <div className="flex items-center gap-6">

          {/* Language Switch */}
          <div className="flex gap-2">
            <button
              onClick={() => i18n.changeLanguage("en")}
              className="text-sm hover:underline"
            >
              EN
            </button>

            <button
              onClick={() => i18n.changeLanguage("el")}
              className="text-sm hover:underline"
            >
              GR
            </button>
          </div>

          {/* Shopping List */}
          <Link
            to="/shopping-list"
            className="relative text-xl"
          >
            🛒

            {items.length > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs px-2 rounded-full">
                {items.length}
              </span>
            )}
          </Link>

        </div>
      </div>
    </nav>
  );
}