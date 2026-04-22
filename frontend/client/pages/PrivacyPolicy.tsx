import { useTranslation } from "react-i18next";

export default function PrivacyPolicy() {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">
        {t("privacy.title")}
      </h1>

      <div className="space-y-6 text-gray-700 leading-7">
        <section>
          <h2 className="text-xl font-semibold mb-2">
            {t("privacy.sections.what.title")}
          </h2>
          <p>{t("privacy.sections.what.text")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">
            {t("privacy.sections.accounts.title")}
          </h2>
          <p>{t("privacy.sections.accounts.text")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">
            {t("privacy.sections.storage.title")}
          </h2>
          <p>{t("privacy.sections.storage.text")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">
            {t("privacy.sections.email.title")}
          </h2>
          <p>{t("privacy.sections.email.text")}</p>
        </section>
      </div>
    </div>
  );
}