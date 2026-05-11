import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Mail, Trash2, ShoppingCart, Send } from "lucide-react";
import { useShoppingList } from "../context/ShoppingListContext";
import { useToast } from "../context/ToastContext";
import { sendShoppingListEmail } from "../api/products";
import ProductImage from "../components/ProductImage";
import { isValidEmail } from "../utils/validateEmail";

export default function ShoppingList() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { items, removeItem } = useShoppingList();

  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendEmail = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      showToast(t("shoppingList.alerts.missingEmail"), "error");
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      showToast(t("shoppingList.alerts.invalidEmail"), "error");
      return;
    }

    if (items.length === 0) {
      showToast(t("shoppingList.alerts.emptyList"), "error");
      return;
    }

    try {
      setSending(true);

      await sendShoppingListEmail(trimmedEmail, items);

      showToast(t("shoppingList.alerts.sent"), "success");
      setEmail("");
    } catch (error: any) {
      const message =
        error?.response?.data?.error || t("shoppingList.alerts.failed");

      showToast(message, "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-white via-brand-cyan/5 to-brand-green/10">
      {/* Hero */}
      <section className="border-b border-brand-blue-darker/10 bg-gradient-to-br from-white via-brand-cyan/10 to-brand-green/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-green/20 bg-white px-4 py-2 text-sm font-medium text-brand-blue-darker shadow-sm mb-5">
              <ShoppingCart size={16} />
              {t("shoppingList.badge")}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-relaxed">
              <span className="block bg-gradient-to-r from-brand-green via-brand-cyan to-brand-blue bg-clip-text text-transparent pb-3">
                {t("shoppingList.title")}
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 leading-8 max-w-2xl">
              {t("shoppingList.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {items.length === 0 ? (
          <div className="bg-white border border-brand-blue-darker/10 rounded-3xl shadow-sm p-10 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-green to-brand-teal flex items-center justify-center shadow-sm">
              <ShoppingCart size={28} className="text-white" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-relaxed">
              {t("shoppingList.emptyTitle")}
            </h2>

            <p className="text-gray-600 max-w-xl mx-auto leading-7">
              {t("shoppingList.empty")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Shopping list items */}
            <div className="xl:col-span-2">
              <div className="bg-white border border-brand-blue-darker/10 rounded-3xl shadow-sm p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-green to-brand-teal flex items-center justify-center shadow-sm">
                    <ShoppingCart size={20} className="text-white" />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-gray-900 leading-relaxed">
                      {t("shoppingList.itemsTitle")}
                    </h2>

                    <p className="text-sm text-gray-600">
                      {t("shoppingList.itemsCount", { count: items.length })}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-brand-blue-darker/10 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white to-brand-cyan/10 flex items-center justify-center shrink-0 overflow-hidden border border-brand-blue-darker/10">
                            <ProductImage
                              src={item.photoURL}
                              alt={item.name}
                              className="w-full h-full rounded-2xl"
                              imgClassName="max-h-14 object-contain"
                            />
                          </div>

                          <div className="min-w-0">
                            <h3 className="font-semibold text-gray-900 leading-7">
                              {item.name}
                            </h3>

                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <span className="inline-flex items-center rounded-full bg-brand-green/10 border border-brand-green/20 px-3 py-1 text-xs font-medium text-brand-blue-darker">
                                {item.supermarket}
                              </span>

                              {item.categoryName && (
                                <span className="text-sm text-gray-500">
                                  {item.categoryName}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          <div className="text-left sm:text-right">
                            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                              {t("shoppingList.price")}
                            </p>

                            <p className="text-2xl font-bold text-brand-blue-darker leading-relaxed">
                              €{item.price}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 text-red-600 px-4 py-3 font-medium hover:bg-red-100 transition-colors"
                          >
                            <Trash2 size={18} />
                            <span>{t("shoppingList.remove")}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Email panel */}
            <div>
              <div className="bg-white border border-brand-blue-darker/10 rounded-3xl shadow-sm p-6 md:p-8 sticky top-24">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-blue-darker to-brand-teal flex items-center justify-center shadow-sm">
                    <Mail size={20} className="text-white" />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-gray-900 leading-relaxed">
                      {t("shoppingList.emailTitle")}
                    </h2>

                    <p className="text-sm text-gray-600">
                      {t("shoppingList.emailSubtitle")}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <input
                    type="email"
                    placeholder={t("shoppingList.emailPlaceholder")}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-2xl border border-brand-blue-darker/10 bg-white px-4 py-3 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  />

                  <p className="text-sm text-gray-600 leading-7">
                    {t("shoppingList.privacyNote")}
                  </p>

                  <button
                    type="button"
                    onClick={handleSendEmail}
                    disabled={sending}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-green to-brand-teal text-white px-4 py-3 font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={18} />

                    <span>
                      {sending
                        ? t("shoppingList.sending")
                        : t("shoppingList.send")}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}