import "./globals.css";

import {
  fetchEnterpriseSettingsSS,
  fetchSettingsSS,
} from "@/components/settings/lib";
import {
  CUSTOM_ANALYTICS_ENABLED,
  SERVER_SIDE_ONLY__PAID_ENTERPRISE_FEATURES_ENABLED,
} from "@/lib/constants";
import { SettingsProvider } from "@/components/settings/SettingsProvider";
import { Metadata } from "next";
import { buildClientUrl } from "@/lib/utilsSS";
import { Inter } from "next/font/google";
import Head from "next/head";
import { EnterpriseSettings, GatingType } from "./admin/settings/interfaces";
import { Card } from "@tremor/react";
import { HeaderTitle } from "@/components/header/HeaderTitle";
import { Logo } from "@/components/Logo";
import { UserProvider } from "@/components/user/UserProvider";
import { ProviderContextProvider } from "@/components/chat_search/ProviderContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  let logoLocation = buildClientUrl("/label.ico");
  let enterpriseSettings: EnterpriseSettings | null = null;
  if (SERVER_SIDE_ONLY__PAID_ENTERPRISE_FEATURES_ENABLED) {
    enterpriseSettings = await (await fetchEnterpriseSettingsSS()).json();
    logoLocation =
      enterpriseSettings && enterpriseSettings.use_custom_logo
        ? "/api/enterprise-settings/logo"
        : buildClientUrl("/label.ico");
  }

  return {
    title: enterpriseSettings?.application_name ?? "Label KI",
    description: "Fragen-Beantwortung für deine Dokumente",
    icons: {
      icon: logoLocation,
    },
  };
}

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const combinedSettings = await fetchSettingsSS();

  const productGating =
    combinedSettings?.settings.product_gating ?? GatingType.NONE;

  if (!combinedSettings) {
    return (
      <html lang="en" className={`${inter.variable} font-sans`}>
        <Head>
          <title>Einstellungen nicht erreichbar | Label KI</title>
        </Head>
        <body className="bg-background text-default">
          <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="mb-2 flex items-center max-w-[175px]">
              <HeaderTitle>Label KI</HeaderTitle>
              <Logo height={40} width={40} />
            </div>

            <Card className="p-8 max-w-md">
              <h1 className="text-2xl font-bold mb-4 text-error">Fehler</h1>
              <p className="text-text-500">
                Deine Label KI-Instanz wurde nicht richtig konfiguriert und
                deine Einstellungen konnten nicht geladen werden. Das kann an
                einem Admin-Konfigurationsproblem oder einer unvollständigen
                Einrichtung liegen.
              </p>
              <p className="mt-4">
                Wenn du ein Admin bist, schaue bitte in{" "}
                <a
                  className="text-link"
                  href="https://docs.danswer.dev/introduction?utm_source=app&utm_medium=error_page&utm_campaign=config_error"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  unsere Doku
                </a>{" "}
                um zu sehen wie man die Label KI richtig konfiguriert. Wenn du ein
                Benutzer bist, kontaktiere bitte deinen Admin um das Problem zu
                beheben.
              </p>
              <p className="mt-4">
                Für zusätzliche Unterstützung und Ratschläge kannst du dich an
                unsere Community auf{" "}
                <a
                  className="text-link"
                  href="https://danswer.ai?utm_source=app&utm_medium=error_page&utm_campaign=config_error"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Slack
                </a>
                {" "}wenden.
              </p>
            </Card>
          </div>
        </body>
      </html>
    );
  }
  if (productGating === GatingType.FULL) {
    return (
      <html lang="en" className={`${inter.variable} font-sans`}>
        <Head>
          <title>Access Restricted | Danswer</title>
        </Head>
        <body className="bg-background text-default">
          <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="mb-2 flex items-center max-w-[175px]">
              <HeaderTitle>Danswer</HeaderTitle>
              <Logo height={40} width={40} />
            </div>
            <Card className="p-8 max-w-md">
              <h1 className="text-2xl font-bold mb-4 text-error">
                Access Restricted
              </h1>
              <p className="text-text-500 mb-4">
                We regret to inform you that your access to Danswer has been
                temporarily suspended due to a lapse in your subscription.
              </p>
              <p className="text-text-500 mb-4">
                To reinstate your access and continue benefiting from
                Danswer&apos;s powerful features, please update your payment
                information.
              </p>
              <p className="text-text-500">
                If you&apos;re an admin, you can resolve this by visiting the
                billing section. For other users, please reach out to your
                administrator to address this matter.
              </p>
            </Card>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, interactive-widget=resizes-content"
        />
      </Head>

      {CUSTOM_ANALYTICS_ENABLED && combinedSettings.customAnalyticsScript && (
        <head>
          <script
            type="text/javascript"
            dangerouslySetInnerHTML={{
              __html: combinedSettings.customAnalyticsScript,
            }}
          />
        </head>
      )}

      <body className={`relative ${inter.variable} font-sans`}>
        <div
          className={`text-default min-h-screen bg-background ${
            // TODO: remove this once proper dark mode exists
            process.env.THEME_IS_DARK?.toLowerCase() === "true" ? "dark" : ""
          }`}
        >
          <UserProvider>
            <ProviderContextProvider>
              <SettingsProvider settings={combinedSettings}>
                {children}
              </SettingsProvider>
            </ProviderContextProvider>
          </UserProvider>
        </div>
      </body>
    </html>
  );
}
