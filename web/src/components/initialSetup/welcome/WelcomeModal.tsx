"use client";

import { Button, Divider, Text } from "@tremor/react";
import { Modal } from "../../Modal";
import Link from "next/link";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { COMPLETED_WELCOME_FLOW_COOKIE } from "./constants";
import { FiCheckCircle, FiMessageSquare, FiShare2 } from "react-icons/fi";
import { useEffect, useState } from "react";
import { BackButton } from "@/components/BackButton";
import { ApiKeyForm } from "@/components/llm/ApiKeyForm";
import { WellKnownLLMProviderDescriptor } from "@/app/admin/configuration/llm/interfaces";
import { checkLlmProvider } from "./lib";
import { User } from "@/lib/types";

function setWelcomeFlowComplete() {
  Cookies.set(COMPLETED_WELCOME_FLOW_COOKIE, "true", { expires: 365 });
}

export function _CompletedWelcomeFlowDummyComponent() {
  setWelcomeFlowComplete();
  return null;
}

function UsageTypeSection({
  title,
  description,
  callToAction,
  icon,
  onClick,
}: {
  title: string;
  description: string | JSX.Element;
  callToAction: string;
  icon?: React.ElementType;
  onClick: () => void;
}) {
  return (
    <div>
      <Text className="font-bold">{title}</Text>
      <div className="text-base mt-1 mb-3">{description}</div>
      <div
        onClick={(e) => {
          e.preventDefault();
          onClick();
        }}
      >
        <div className="text-link font-medium cursor-pointer select-none">
          {callToAction}
        </div>
      </div>
    </div>
  );
}

export function _WelcomeModal({ user }: { user: User | null }) {
  const router = useRouter();
  const [selectedFlow, setSelectedFlow] = useState<null | "search" | "chat">(
    null
  );
  const [isHidden, setIsHidden] = useState(false);
  const [apiKeyVerified, setApiKeyVerified] = useState<boolean>(false);
  const [providerOptions, setProviderOptions] = useState<
    WellKnownLLMProviderDescriptor[]
  >([]);

  useEffect(() => {
    async function fetchProviderInfo() {
      const { providers, options, defaultCheckSuccessful } =
        await checkLlmProvider(user);
      setApiKeyVerified(providers.length > 0 && defaultCheckSuccessful);
      setProviderOptions(options);
    }

    fetchProviderInfo();
  }, []);

  if (isHidden) {
    return null;
  }

  let title;
  let body;
  switch (selectedFlow) {
    case "search":
      title = undefined;
      body = (
        <div className="max-h-[85vh] overflow-y-auto px-4 pb-4">
          <BackButton behaviorOverride={() => setSelectedFlow(null)} />
          <div className="mt-3">
            <Text className="font-bold flex">
              {apiKeyVerified && (
                <FiCheckCircle className="my-auto mr-2 text-success" />
              )}
              Schritt 1: Richte ein LLM ein
            </Text>
            <div>
              {apiKeyVerified ? (
                <Text className="mt-2">
                  LLM-Einrichtung abgeschlossen!
                  <br /> <br />
                  Falls du später den API-Schlüssel ändern willst, kannst du
                  das ganz einfach im Admin-Panel tun.
                </Text>
              ) : (
                <ApiKeyForm
                  onSuccess={() => setApiKeyVerified(true)}
                  providerOptions={providerOptions}
                />
              )}
            </div>
            <Text className="font-bold mt-6 mb-2">
              Schritt 2: Datenquellen anbinden
            </Text>
            <div>
              <Text>
                Anbindungen sind der Weg, durch den Danswer Daten aus den
                verschiedenen Datenquellen deiner Organisation bekommt. Sobald
                die Einrichtung abgeschlossen ist, synchronisieren wir automatisch
                Daten aus deinen Apps und Dokumenten zu Danswer, sodass du sie
                alle an einem Ort durchsuchen kannst.
              </Text>

              <div className="flex mt-3">
                <Link
                  href="/admin/add-connector"
                  onClick={(e) => {
                    e.preventDefault();
                    setWelcomeFlowComplete();
                    router.push("/admin/add-connector");
                  }}
                  className="w-fit mx-auto"
                >
                  <Button size="xs" icon={FiShare2} disabled={!apiKeyVerified}>
                    Richte deine erste Anbindung ein!
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
      break;
    case "chat":
      title = undefined;
      body = (
        <div className="mt-3 max-h-[85vh] overflow-y-auto px-4 pb-4">
          <BackButton behaviorOverride={() => setSelectedFlow(null)} />

          <div className="mt-3">
            <Text className="font-bold flex">
              {apiKeyVerified && (
                <FiCheckCircle className="my-auto mr-2 text-success" />
              )}
              Schritt 1: Richte ein LLM ein
            </Text>
            <div>
              {apiKeyVerified ? (
                <Text className="mt-2">
                  LLM-Einrichtung abgeschlossen!
                  <br /> <br />
                  Falls du später den API-Schlüssel ändern willst, kannst du
                  das ganz einfach im Admin-Panel tun.
                </Text>
              ) : (
                <div>
                  <ApiKeyForm
                    onSuccess={() => setApiKeyVerified(true)}
                    providerOptions={providerOptions}
                  />
                </div>
              )}
            </div>

            <Text className="font-bold mt-6 mb-2 flex">
              Schritt 2: Beginne zu chatten!
            </Text>

            <Text>
              Klicke auf den untenstehenden Button, um mit dem oben konfigurierten
              LLM zu chatten! Keine Sorge – wenn du dich doch später dazu entschließt,
              das Wissen deiner Organisation zu verknüpfen, kannst du das jederzeit
              im{" "}
              <Link
                className="text-link"
                href="/admin/add-connector"
                onClick={(e) => {
                  e.preventDefault();
                  setWelcomeFlowComplete();
                  router.push("/admin/add-connector");
                }}
              >
                Admin-Panel
              </Link>
              tun.
            </Text>

            <div className="flex mt-3">
              <Link
                href="/chat"
                onClick={(e) => {
                  e.preventDefault();
                  setWelcomeFlowComplete();
                  router.push("/chat");
                  setIsHidden(true);
                }}
                className="w-fit mx-auto"
              >
                <Button size="xs" icon={FiShare2} disabled={!apiKeyVerified}>
                  Beginne zu chatten!
                </Button>
              </Link>
            </div>
          </div>
        </div>
      );
      break;
    default:
      title = "🎉 Willkommen bei Danswer";
      body = (
        <>
          <div>
            <Text>Wie planst du, Danswer zu nutzen?</Text>
          </div>
          <Divider />
          <UsageTypeSection
            title="Suchen/chatten mit Wissen"
            description={
              <Text>
                Wenn du das Wissen deiner Organisation durchsuchen, chatten
                oder direkte Fragen stellen möchtest, dann ist das die richtige
                Option für dich!
              </Text>
            }
            callToAction="Loslegen"
            onClick={() => setSelectedFlow("search")}
          />
          <Divider />
          <UsageTypeSection
            title="Sicheres ChatGPT"
            description={
              <Text>
                Wenn du ein reines ChatGPT-Erlebnis suchst, dann ist das die
                richtige Option für dich!
              </Text>
            }
            icon={FiMessageSquare}
            callToAction="Loslegen"
            onClick={() => {
              setSelectedFlow("chat");
            }}
          />

          {/* TODO: add a Slack option here */}
          {/* <Divider />
          <UsageTypeSection
            title="AI-powered Slack Assistant"
            description="If you're looking to setup a bot to auto-answer questions in Slack"
            callToAction="Connect your company knowledge!"
            link="/admin/add-connector"
          /> */}
        </>
      );
  }

  return (
    <Modal title={title} className="max-w-4xl">
      <div className="text-base">{body}</div>
    </Modal>
  );
}
