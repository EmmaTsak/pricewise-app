import {
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Heart,
  ShoppingCart,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="bg-gradient-to-b from-white to-brand-blue-darker/5 border-t border-brand-blue-darker/10">
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
                PriceCompare
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Smart grocery price comparison for savvy shoppers. Compare prices across stores and save big.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-white hover:bg-brand-blue-darker text-brand-blue-darker hover:text-white transition-all flex items-center justify-center shadow-sm hover:shadow-md"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-white hover:bg-brand-teal text-brand-teal hover:text-white transition-all flex items-center justify-center shadow-sm hover:shadow-md"
              >
                <Twitter size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-white hover:bg-brand-cyan text-brand-cyan hover:text-white transition-all flex items-center justify-center shadow-sm hover:shadow-md"
              >
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-brand-blue-darker transition-colors text-sm"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-brand-blue-darker transition-colors text-sm"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-brand-blue-darker transition-colors text-sm"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-brand-blue-darker transition-colors text-sm"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-brand-blue-darker transition-colors text-sm"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Phone size={18} className="text-brand-blue-darker mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-600 text-sm">1-800-COMPARE</p>
                  <p className="text-gray-500 text-xs">Available 24/7</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={18} className="text-brand-teal mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-600 text-sm">support@pricecompare.com</p>
                  <p className="text-gray-500 text-xs">Response within 2 hours</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-brand-cyan mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-600 text-sm">123 Smart Shopping Blvd</p>
                  <p className="text-gray-500 text-xs">Your City, ST 12345</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 py-6 flex flex-col sm:flex-row items-center justify-between">
          <p className="text-gray-600 text-sm flex items-center gap-2">
            © {currentYear} PriceCompare. Made with{" "}
            <Heart size={16} className="text-brand-green fill-brand-green" />
            for smart shoppers.
          </p>
          <div className="flex gap-6 mt-4 sm:mt-0">
            <a
              href="#"
              className="text-gray-600 hover:text-brand-blue-darker transition-colors text-sm"
            >
              Accessibility
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-brand-blue-darker transition-colors text-sm"
            >
              Sitemap
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-brand-blue-darker transition-colors text-sm"
            >
              Feedback
            </a>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
}
