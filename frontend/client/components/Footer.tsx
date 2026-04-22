import {
  Heart,
  ShoppingCart,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();

  return (
    <footer className="bg-gradient-to-b from-white to-brand-blue-darker/5 border-t border-brand-blue-darker/10 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
          {/* Brand Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-green to-brand-teal rounded-lg flex items-center justify-center">
                <ShoppingCart size={18} className="text-white" />
              </div>

              <span className="text-lg font-bold bg-gradient-to-r from-brand-blue-darker via-brand-blue-dark to-brand-teal bg-clip-text text-transparent">
                PriceWise
              </span>
            </div>

            <p className="text-gray-600 text-sm mb-4 max-w-sm">
              {t("footer.description")}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">
              {t("footer.navigationTitle")}
            </h3>

            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-600 hover:text-brand-blue-darker transition-colors text-sm"
                >
                  {t("nav.compare")}
                </Link>
              </li>

              <li>
                <Link
                  to="/shopping-list"
                  className="text-gray-600 hover:text-brand-blue-darker transition-colors text-sm"
                >
                  {t("nav.shoppingList")}
                </Link>
              </li>

              <li>
                <Link
                  to="/about"
                  className="text-gray-600 hover:text-brand-blue-darker transition-colors text-sm"
                >
                  {t("nav.about")}
                </Link>
              </li>

              <li>
                <Link
                  to="/privacy"
                  className="text-gray-600 hover:text-brand-blue-darker transition-colors text-sm"
                >
                  {t("footer.privacy")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Privacy / Storage Summary */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">
              {t("footer.privacyTitle")}
            </h3>

            <ul className="space-y-3 text-sm text-gray-600">
              <li>{t("footer.privacyPoint1")}</li>
              <li>{t("footer.privacyPoint2")}</li>
              <li>{t("footer.privacyPoint3")}</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-sm flex items-center gap-2 text-center sm:text-left">
            © {currentYear} PriceWise. {t("footer.madeWith")}
            <Heart size={16} className="text-brand-green fill-brand-green" />
            {t("footer.forShoppers")}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link
              to="/privacy"
              className="text-gray-600 hover:text-brand-blue-darker transition-colors text-sm"
            >
              {t("footer.privacy")}
            </Link>

            <Link
              to="/about"
              className="text-gray-600 hover:text-brand-blue-darker transition-colors text-sm"
            >
              {t("nav.about")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}