"use client";

import React from "react";
import { Button, Divider, Text } from "@tremor/react";
import { Modal } from "../../Modal";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { COMPLETED_WELCOME_FLOW_COOKIE } from "./constants";
import { useEffect, useState } from "react";
import { ApiKeyForm } from "@/components/llm/ApiKeyForm";
import { WellKnownLLMProviderDescriptor } from "@/app/admin/configuration/llm/interfaces";
import { checkLlmProvider } from "./lib";
import { User } from "@/lib/types";
import { useProviderStatus } from "@/components/chat_search/ProviderContext";

import { usePopup } from "@/components/admin/connectors/Popup";

function setWelcomeFlowComplete() {
  Cookies.set(COMPLETED_WELCOME_FLOW_COOKIE, "true", { expires: 365 });
}

export function _CompletedWelcomeFlowDummyComponent() {
  setWelcomeFlowComplete();
  return null;
}

export function _WelcomeModal({ user }: { user: User | null }) {
  const router = useRouter();

  const [canBegin, setCanBegin] = useState(false);
  const [providerOptions, setProviderOptions] = useState<
    WellKnownLLMProviderDescriptor[]
  >([]);
  const { popup, setPopup } = usePopup();

  const { refreshProviderInfo } = useProviderStatus();
  const clientSetWelcomeFlowComplete = async () => {
    setWelcomeFlowComplete();
    refreshProviderInfo();
    router.refresh();
  };

  useEffect(() => {
    async function fetchProviderInfo() {
      const { options } = await checkLlmProvider(user);
      setProviderOptions(options);
    }

    fetchProviderInfo();
  }, [user]);

  // We should always have options
  if (providerOptions.length === 0) {
    return null;
  }

  return (
    <>
      {popup}

      <Modal
        title={"Willkommen bei Danswer!"}
        width="w-full max-h-[900px] overflow-y-scroll max-w-3xl"
      >
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
              setPopup={setPopup}
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
    </>
  );
}
