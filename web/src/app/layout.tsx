import "./globals.css";

import {
  fetchEnterpriseSettingsSS,
  fetchSettingsSS,
} from "@/components/settings/lib";
import {
  CUSTOM_ANALYTICS_ENABLED,
  SERVER_SIDE_ONLY__PAID_ENTERPRISE_FEATURES_ENABLED,
} from "@/lib/constants";
import { Metadata } from "next";
import { buildClientUrl } from "@/lib/utilsSS";
import { Inter } from "next/font/google";
import { EnterpriseSettings, GatingType } from "./admin/settings/interfaces";
import { HeaderTitle } from "@/components/header/HeaderTitle";
import { Logo } from "@/components/Logo";
import { fetchAssistantData } from "@/lib/chat/fetchAssistantdata";
import { AppProvider } from "@/components/context/AppProvider";
import { PHProvider } from "./providers";
import { getCurrentUserSS } from "@/lib/userSS";
import CardSection from "@/components/admin/CardSection";
import { Suspense } from "react";
import PostHogPageView from "./PostHogPageView";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  let logoLocation = buildClientUrl("/danswer.ico");
  let enterpriseSettings: EnterpriseSettings | null = null;
  if (SERVER_SIDE_ONLY__PAID_ENTERPRISE_FEATURES_ENABLED) {
    enterpriseSettings = await (await fetchEnterpriseSettingsSS()).json();
    logoLocation =
      enterpriseSettings && enterpriseSettings.use_custom_logo
        ? "/api/enterprise-settings/logo"
        : buildClientUrl("/danswer.ico");
  }

  return {
    title: enterpriseSettings?.application_name ?? "Danswer",
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
  const [combinedSettings, assistantsData, user] = await Promise.all([
    fetchSettingsSS(),
    fetchAssistantData(),
    getCurrentUserSS(),
  ]);

  const productGating =
    combinedSettings?.settings.product_gating ?? GatingType.NONE;

  const getPageContent = (content: React.ReactNode) => (
    <html lang="en" className={`${inter.variable} font-sans`}>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, interactive-widget=resizes-content"
        />
        {CUSTOM_ANALYTICS_ENABLED &&
          combinedSettings?.customAnalyticsScript && (
            <script
              type="text/javascript"
              dangerouslySetInnerHTML={{
                __html: combinedSettings.customAnalyticsScript,
              }}
            />
          )}
      </head>
      <body className={`relative ${inter.variable} font-sans`}>
        <div
          className={`text-default min-h-screen bg-background ${
            process.env.THEME_IS_DARK?.toLowerCase() === "true" ? "dark" : ""
          }`}
        >
          <PHProvider>{content}</PHProvider>
        </div>
      </body>
    </html>
  );

  if (!combinedSettings) {
    return getPageContent(
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="mb-2 flex items-center max-w-[175px]">
          <HeaderTitle>Danswer</HeaderTitle>
          <Logo height={40} width={40} />
        </div>

        <CardSection className="max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-error">Fehler</h1>
          <p className="text-text-500">
            Deine Danswer-Instanz wurde nicht richtig konfiguriert und
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
            um zu sehen wie man Danswer richtig konfiguriert. Wenn du ein
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
        </CardSection>
      </div>
    );
  }
  if (productGating === GatingType.FULL) {
    return getPageContent(
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="mb-2 flex items-center max-w-[175px]">
          <HeaderTitle>Danswer</HeaderTitle>
          <Logo height={40} width={40}/>
        </div>
        <CardSection className="w-full max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-error">
            Zugang eingeschränkt
          </h1>
          <p className="text-text-500 mb-4">
            Es tut uns leid, dir mitteilen zu müssen, dass dein Zugang zu Danswer
            aufgrund eines Abonnement-Ausfalls vorübergehend gesperrt wurde.
          </p>
          <p className="text-text-500 mb-4">
            Um deinen Zugang wiederherzustellen und weiterhin von den
            leistungsstarken Funktionen von Danswer zu profitieren, aktualisiere
            bitte deine Zahlungsinformationen.
          </p>
          <p className="text-text-500">
            Wenn du ein Admin bist, kannst du dies im Abrechnungsbereich lösen.
            Für andere Nutzer, bitte wende dich an deinen Administrator, um dieses
            Problem zu klären.
          </p>
        </CardSection>
      </div>
    );
  }

  const { assistants, hasAnyConnectors, hasImageCompatibleModel } =
    assistantsData;

  return getPageContent(
    <AppProvider
      user={user}
      settings={combinedSettings}
      assistants={assistants}
      hasAnyConnectors={hasAnyConnectors}
      hasImageCompatibleModel={hasImageCompatibleModel}
    >
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </AppProvider>
  );
}
