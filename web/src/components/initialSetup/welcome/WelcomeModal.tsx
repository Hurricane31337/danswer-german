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
import { useProviderStatus } from "@/components/chat_search/ProviderContext";

function setWelcomeFlowComplete() {
  Cookies.set(COMPLETED_WELCOME_FLOW_COOKIE, "true", { expires: 365 });
}

export function _CompletedWelcomeFlowDummyComponent() {
  setWelcomeFlowComplete();
  return null;
}

export function _WelcomeModal({ user }: { user: User | null }) {
  const router = useRouter();
  const [selectedFlow, setSelectedFlow] = useState<null | "search" | "chat">(
    null
  );
  const [canBegin, setCanBegin] = useState(false);
  const [apiKeyVerified, setApiKeyVerified] = useState<boolean>(false);
  const [providerOptions, setProviderOptions] = useState<
    WellKnownLLMProviderDescriptor[]
  >([]);
  const { refreshProviderInfo } = useProviderStatus();
  const clientSetWelcomeFlowComplete = async () => {
    setWelcomeFlowComplete();
    refreshProviderInfo();
    router.refresh();
  };

  useEffect(() => {
    async function fetchProviderInfo() {
      const { providers, options, defaultCheckSuccessful } =
        await checkLlmProvider(user);
      setApiKeyVerified(providers.length > 0 && defaultCheckSuccessful);
      setProviderOptions(options);
    }

    fetchProviderInfo();
  }, []);

  return (
    <Modal title={"Willkommen bei Danswer!"} width="w-full max-w-3xl">
      <div>
        <Text className="mb-4">
          Danswer bringt all das Wissen deiner Firma an deine
          Fingerspitzen &ndash; bereit, sofort abgerufen zu werden.
        </Text>
        <Text className="mb-4">
          Um zu beginnen, müssen wir einen API-Schlüssel für den LLM-Anbieter
          einrichten. Dieser Schlüssel ermöglicht es Danswer, mit dem KI-Modell
          zu interagieren und intelligente Antworten auf deine Anfragen zu liefern.
        </Text>

        <div className="max-h-[900px] overflow-y-scroll">
          <ApiKeyForm
            hidePopup
            onSuccess={() => {
              router.refresh();
              refreshProviderInfo();
              setCanBegin(true);
            }}
            providerOptions={providerOptions}
          />
        </div>
        <Divider />
        <Button disabled={!canBegin} onClick={clientSetWelcomeFlowComplete}>
          Loslegen
        </Button>
      </div>
    </Modal>
  );
}
