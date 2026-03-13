import { useState } from "react";
import { Menu, X, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { i18n } = useTranslation();

  return (
    <nav className="bg-gradient-to-r from-white via-brand-cyan/3 to-white border-b border-brand-blue-darker/10 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-green to-brand-teal rounded-lg flex items-center justify-center">
              <ShoppingCart size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-brand-blue-darker via-brand-blue-dark to-brand-teal bg-clip-text text-transparent">
              PriceWise
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-brand-blue-darker font-medium transition-colors"
            >
              Compare Prices
            </Link>
            <Link
              to="/shopping-list"
              className="text-gray-700 hover:text-brand-blue-darker font-medium transition-colors"
            >
              Shopping List
            </Link>
            <Link
              to="/about"
              className="text-gray-700 hover:text-brand-blue-darker font-medium transition-colors"
            >
              About
            </Link>
            <button onClick={() => i18n.changeLanguage("en")}>EN</button>
            <button onClick={() => i18n.changeLanguage("el")}>GR</button>
          </div>


          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-700 hover:text-brand-blue-darker transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100">
            <div className="flex flex-col gap-4 pt-4">
              <Link
                to="/"
                className="text-gray-700 hover:text-brand-blue-darker font-medium transition-colors"
              >
                Compare Prices
              </Link>
              <Link
                to="/shopping-list"
                className="text-gray-700 hover:text-brand-blue-darker font-medium transition-colors"
              >
                Shopping List
              </Link>
              <Link
                to="/about"
                className="text-gray-700 hover:text-brand-blue-darker font-medium transition-colors"
              >
                About
              </Link>
              <div className="flex gap-3 pt-4">
                <Link
                  to="/sign-in"
                  className="flex-1 px-4 py-2 text-brand-blue-darker font-semibold hover:text-brand-blue transition-colors border border-brand-blue-darker rounded-lg text-center"
                >
                  Sign In
                </Link>
                <Link
                  to="/sign-up"
                  className="flex-1 px-4 py-2 bg-brand-blue-darker text-white rounded-lg font-semibold hover:shadow-lg transition-shadow text-center"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
