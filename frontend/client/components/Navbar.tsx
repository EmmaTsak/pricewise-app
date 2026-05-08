import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useShoppingList } from "../context/ShoppingListContext";

export default function Navbar() {
  const { i18n, t } = useTranslation();
  const { items } = useShoppingList();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentLanguage = i18n.language.startsWith("el") ? "el" : "en";

  const navLinkClass = (path: string) =>
    `font-medium transition-colors ${
      location.pathname === path
        ? "text-brand-blue-darker"
        : "text-gray-700 hover:text-brand-blue-darker"
    }`;

  const mobileNavLinkClass = (path: string) =>
    `block rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
      location.pathname === path
        ? "bg-brand-blue-darker text-white"
        : "text-gray-700 hover:bg-brand-blue-darker/5 hover:text-brand-blue-darker"
    }`;

  const changeLanguage = (lang: "en" | "el") => {
    i18n.changeLanguage(lang);
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-white via-brand-cyan/5 to-white border-b border-brand-blue-darker/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            onClick={closeMobileMenu}
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-brand-green to-brand-teal rounded-lg flex items-center justify-center shadow-sm">
              <ShoppingCart size={18} className="text-white" />
            </div>

            <span className="text-xl font-bold bg-gradient-to-r from-brand-blue-darker via-brand-blue-dark to-brand-teal bg-clip-text text-transparent">
              PriceWise
            </span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/compare-groups" className={navLinkClass("/compare-groups")}>
              Group Compare
            </Link>
            
            <Link to="/" className={navLinkClass("/")}>
              {t("nav.compare")}
            </Link>

            <Link
              to="/shopping-list"
              className={navLinkClass("/shopping-list")}
            >
              {t("nav.shoppingList")}
            </Link>

            <Link to="/about" className={navLinkClass("/about")}>
              {t("nav.about")}
            </Link>

            <Link to="/privacy" className={navLinkClass("/privacy")}>
              {t("footer.privacy")}
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Language switcher */}
            <div className="hidden sm:flex items-center rounded-full border border-brand-blue-darker/10 bg-white shadow-sm overflow-hidden">
              <button
                onClick={() => changeLanguage("en")}
                className={`px-3 py-1.5 text-sm font-semibold transition-colors ${
                  currentLanguage === "en"
                    ? "bg-brand-blue-darker text-white"
                    : "text-brand-blue-darker hover:bg-brand-blue-darker/5"
                }`}
              >
                EN
              </button>

              <button
                onClick={() => changeLanguage("el")}
                className={`px-3 py-1.5 text-sm font-semibold transition-colors ${
                  currentLanguage === "el"
                    ? "bg-brand-blue-darker text-white"
                    : "text-brand-blue-darker hover:bg-brand-blue-darker/5"
                }`}
              >
                GR
              </button>
            </div>

            {/* Shopping list button */}
            <Link
              to="/shopping-list"
              className="relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-white border border-brand-blue-darker/10 text-brand-blue-darker hover:shadow-md transition-shadow"
              aria-label={t("nav.shoppingList")}
            >
              <ShoppingCart size={20} />

              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-brand-teal text-white text-xs font-bold flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full bg-white border border-brand-blue-darker/10 text-brand-blue-darker hover:shadow-md transition-shadow"
              aria-label={mobileOpen ? t("nav.closeMenu") : t("nav.openMenu")}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4">
            <div className="bg-white border border-brand-blue-darker/10 rounded-3xl shadow-sm p-4 space-y-3">
              <Link
                to="/compare-groups"
                className={mobileNavLinkClass("/compare-groups")}
                onClick={closeMobileMenu}
              >
                Group Compare
              </Link>
              
              <Link
                to="/"
                className={mobileNavLinkClass("/")}
                onClick={closeMobileMenu}
              >
                {t("nav.compare")}
              </Link>

              <Link
                to="/shopping-list"
                className={mobileNavLinkClass("/shopping-list")}
                onClick={closeMobileMenu}
              >
                {t("nav.shoppingList")}
              </Link>

              <Link
                to="/about"
                className={mobileNavLinkClass("/about")}
                onClick={closeMobileMenu}
              >
                {t("nav.about")}
              </Link>

              <Link
                to="/privacy"
                className={mobileNavLinkClass("/privacy")}
                onClick={closeMobileMenu}
              >
                {t("footer.privacy")}
              </Link>

              <div className="pt-2 border-t border-brand-blue-darker/10">
                <p className="text-xs font-medium text-gray-500 mb-3 px-1">
                  {t("nav.language")}
                </p>

                <div className="flex items-center rounded-full border border-brand-blue-darker/10 bg-white shadow-sm overflow-hidden w-fit">
                  <button
                    onClick={() => changeLanguage("en")}
                    className={`px-4 py-2 text-sm font-semibold transition-colors ${
                      currentLanguage === "en"
                        ? "bg-brand-blue-darker text-white"
                        : "text-brand-blue-darker hover:bg-brand-blue-darker/5"
                    }`}
                  >
                    EN
                  </button>

                  <button
                    onClick={() => changeLanguage("el")}
                    className={`px-4 py-2 text-sm font-semibold transition-colors ${
                      currentLanguage === "el"
                        ? "bg-brand-blue-darker text-white"
                        : "text-brand-blue-darker hover:bg-brand-blue-darker/5"
                    }`}
                  >
                    GR
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}