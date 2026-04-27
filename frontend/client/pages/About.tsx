import { Link } from "react-router-dom";
import { ArrowLeft, Target, Users, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-brand-blue-darker hover:text-brand-blue-dark transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          {t("about.backHome")}
        </Link>

        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 leading-relaxed">
          {t("about.title")}
          <span className="block bg-gradient-to-r from-brand-green via-brand-cyan to-brand-blue bg-clip-text text-transparent">
            PriceWise
          </span>
        </h1>

        <p className="text-xl text-gray-600 max-w-3xl">
          {t("about.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <InfoCard
          icon={<Target size={24} className="text-white" />}
          title={t("about.cards.mission.title")}
          text={t("about.cards.mission.text")}
          className="from-brand-green/10 to-brand-teal/10 border-brand-green/20"
          iconClassName="from-brand-green to-brand-teal"
        />

        <InfoCard
          icon={<Zap size={24} className="text-white" />}
          title={t("about.cards.approach.title")}
          text={t("about.cards.approach.text")}
          className="from-brand-cyan/10 to-brand-blue/10 border-brand-cyan/20"
          iconClassName="from-brand-cyan to-brand-blue"
        />

        <InfoCard
          icon={<Users size={24} className="text-white" />}
          title={t("about.cards.privacy.title")}
          text={t("about.cards.privacy.text")}
          className="from-brand-blue-dark/10 to-brand-teal/10 border-brand-blue-dark/20"
          iconClassName="from-brand-blue-dark to-brand-teal"
        />
      </div>

      <div className="mb-16">
        <h2 className="text-4xl font-bold text-gray-900 mb-8">
          {t("about.features.title")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {["pricing", "comparison", "lists", "free"].map((key) => (
            <div key={key} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-brand-green rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">✓</span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t(`about.features.items.${key}.title`)}
                </h3>
                <p className="text-gray-600">
                  {t(`about.features.items.${key}.text`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-brand-green to-brand-teal rounded-xl p-8 sm:p-12 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          {t("about.cta.title")}
        </h2>
        <p className="text-white text-lg mb-6 max-w-2xl mx-auto">
          {t("about.cta.text")}
        </p>
        <Link
          to="/"
          className="inline-block px-8 py-3 bg-white text-brand-blue-darker font-semibold rounded-lg hover:shadow-lg transition-shadow"
        >
          {t("about.cta.button")}
        </Link>
      </div>
    </div>
  );
}

type InfoCardProps = {
  icon: React.ReactNode;
  title: string;
  text: string;
  className: string;
  iconClassName: string;
};

function InfoCard({
  icon,
  title,
  text,
  className,
  iconClassName,
}: InfoCardProps) {
  return (
    <div className={`bg-gradient-to-br rounded-xl p-8 border ${className}`}>
      <div
        className={`w-12 h-12 bg-gradient-to-br rounded-lg flex items-center justify-center mb-4 ${iconClassName}`}
      >
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-700">{text}</p>
    </div>
  );
}