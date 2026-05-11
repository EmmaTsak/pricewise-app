import { Database, Lock, Mail, ShieldCheck, UserX } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function PrivacyPolicy() {
  const { t } = useTranslation();

  const privacyPoints = [
    {
      icon: UserX,
      title: t("privacy.points.noAccounts.title", {
        defaultValue: "No user accounts",
      }),
      description: t("privacy.points.noAccounts.description", {
        defaultValue:
          "PriceWise does not require registration, login, usernames, or passwords.",
      }),
    },
    {
      icon: Database,
      title: t("privacy.points.localStorage.title", {
        defaultValue: "Shopping list stays local",
      }),
      description: t("privacy.points.localStorage.description", {
        defaultValue:
          "Your shopping list is stored in your browser using localStorage, not in a user account.",
      }),
    },
    {
      icon: Mail,
      title: t("privacy.points.emailConsent.title", {
        defaultValue: "Email only with consent",
      }),
      description: t("privacy.points.emailConsent.description", {
        defaultValue:
          "Your email is used only when you choose to send your shopping list and confirm consent.",
      }),
    },
    {
      icon: Lock,
      title: t("privacy.points.minimalData.title", {
        defaultValue: "Minimal data approach",
      }),
      description: t("privacy.points.minimalData.description", {
        defaultValue:
          "The application is designed to avoid collecting unnecessary personal data.",
      }),
    },
  ];

  return (
    <div className="min-h-full bg-gradient-to-br from-white via-brand-cyan/5 to-brand-green/10">
      {/* Hero */}
      <section className="border-b border-brand-blue-darker/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-green/20 bg-white px-4 py-2 text-sm font-medium text-brand-blue-darker shadow-sm mb-5">
              <ShieldCheck size={16} />
              {t("privacy.badge", {
                defaultValue: "Privacy Policy",
              })}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              {t("privacy.title", {
                defaultValue: "Your privacy matters",
              })}

              <span className="block bg-gradient-to-r from-brand-green via-brand-cyan to-brand-blue bg-clip-text text-transparent pb-2">
                {t("privacy.highlight", {
                  defaultValue: "simple, transparent, minimal",
                })}
              </span>
            </h1>

            <p className="text-lg text-gray-600 max-w-2xl">
              {t("privacy.subtitle", {
                defaultValue:
                  "PriceWise is designed as a privacy-friendly grocery comparison app. It does not use user accounts and avoids storing unnecessary personal information.",
              })}
            </p>
          </div>
        </div>
      </section>

      {/* Privacy cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {privacyPoints.map((point) => {
            const Icon = point.icon;

            return (
              <div
                key={point.title}
                className="bg-white rounded-3xl border border-brand-blue-darker/10 shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-green to-brand-teal flex items-center justify-center text-white mb-4">
                  <Icon size={22} />
                </div>

                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  {point.title}
                </h2>

                <p className="text-sm text-gray-600 leading-6">
                  {point.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Main policy content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <PolicySection
              title={t("privacy.sections.dataWeCollect.title", {
                defaultValue: "1. Data we collect",
              })}
            >
              <p>
                {t("privacy.sections.dataWeCollect.text", {
                  defaultValue:
                    "PriceWise does not collect personal data through user accounts because the application does not include registration or login functionality.",
                })}
              </p>

              <p>
                {t("privacy.sections.dataWeCollect.email", {
                  defaultValue:
                    "If you choose to email your shopping list to yourself, the email address you provide is used only for sending that message.",
                })}
              </p>
            </PolicySection>

            <PolicySection
              title={t("privacy.sections.localStorage.title", {
                defaultValue: "2. Local shopping list storage",
              })}
            >
              <p>
                {t("privacy.sections.localStorage.text", {
                  defaultValue:
                    "The shopping list is stored in your browser using localStorage. This means the list remains on your device and is not connected to a user profile.",
                })}
              </p>
            </PolicySection>

            <PolicySection
              title={t("privacy.sections.email.title", {
                defaultValue: "3. Email consent",
              })}
            >
              <p>
                {t("privacy.sections.email.text", {
                  defaultValue:
                    "Before sending a shopping list by email, PriceWise asks for consent. The email feature is optional and only runs when you choose to use it.",
                })}
              </p>
            </PolicySection>

            <PolicySection
              title={t("privacy.sections.cookies.title", {
                defaultValue: "4. Cookies and tracking",
              })}
            >
              <p>
                {t("privacy.sections.cookies.text", {
                  defaultValue:
                    "PriceWise does not require tracking cookies for core functionality. Any future analytics or optional tracking tools should be clearly explained and require appropriate consent where necessary.",
                })}
              </p>
            </PolicySection>

            <PolicySection
              title={t("privacy.sections.thirdParty.title", {
                defaultValue: "5. Third-party services",
              })}
            >
              <p>
                {t("privacy.sections.thirdParty.text", {
                  defaultValue:
                    "PriceWise may use supermarket product pages as data sources and may use email delivery tools such as Nodemailer for sending shopping lists. These tools are used only for the app's intended functionality.",
                })}
              </p>
            </PolicySection>

            <PolicySection
              title={t("privacy.sections.rights.title", {
                defaultValue: "6. Your rights",
              })}
            >
              <p>
                {t("privacy.sections.rights.text", {
                  defaultValue:
                    "Because PriceWise does not use user accounts, there is no account profile to delete. You can clear your shopping list at any time by removing it inside the app or clearing your browser storage.",
                })}
              </p>
            </PolicySection>
          </div>

          {/* Side note */}
          <aside>
            <div className="sticky top-24 bg-gradient-to-br from-brand-blue-darker to-brand-teal rounded-3xl shadow-sm p-6 text-white">
              <ShieldCheck size={34} className="mb-4" />

              <h2 className="text-xl font-bold mb-3">
                {t("privacy.side.title", {
                  defaultValue: "Privacy-first MVP",
                })}
              </h2>

              <p className="text-white/85 leading-7 mb-5">
                {t("privacy.side.text", {
                  defaultValue:
                    "The simplest way to protect users is to avoid collecting data that the application does not need.",
                })}
              </p>

              <div className="rounded-2xl bg-white/10 border border-white/20 p-4">
                <p className="text-sm text-white/90 leading-6">
                  {t("privacy.side.note", {
                    defaultValue:
                      "This page is written for the PriceWise MVP. If the app later adds accounts, analytics, payments, or advanced tracking, this policy should be updated.",
                  })}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

type PolicySectionProps = {
  title: string;
  children: React.ReactNode;
};

function PolicySection({ title, children }: PolicySectionProps) {
  return (
    <div className="bg-white rounded-3xl border border-brand-blue-darker/10 shadow-sm p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>

      <div className="space-y-4 text-gray-600 leading-7">{children}</div>
    </div>
  );
}