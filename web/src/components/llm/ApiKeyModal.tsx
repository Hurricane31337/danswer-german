"use client";

import { ApiKeyForm } from "./ApiKeyForm";
import { Modal } from "../Modal";
import { useRouter } from "next/navigation";
import { useProviderStatus } from "../chat_search/ProviderContext";

export const ApiKeyModal = ({ hide }: { hide: () => void }) => {
  const router = useRouter();

  const {
    shouldShowConfigurationNeeded,
    providerOptions,
    refreshProviderInfo,
  } = useProviderStatus();

  if (!shouldShowConfigurationNeeded) {
    return null;
  }

  return (
    <Modal
      title="Stelle einen API-Schlüssel ein!"
      width="max-w-3xl w-full"
      onOutsideClick={() => hide()}
    >
      <div className="max-h-[75vh] overflow-y-auto flex flex-col">
        <div>
          <div className="mb-5 text-sm">
            Bitte gib unten einen API-Schlüssel ein, um mit der Nutzung
            von Danswer zu beginnen – du kannst ihn später jederzeit ändern.
            <br />
            Wenn du dich lieber erst einmal umsehen möchtest, kannst du
            <strong onClick={() => hide()} className="text-link cursor-pointer">
              {" "}
              diesen Schritt überspringen
            </strong>
            .
          </div>

          <ApiKeyForm
            onSuccess={() => {
              router.refresh();
              refreshProviderInfo();
              hide();
            }}
            providerOptions={providerOptions}
          />
        </div>
      </div>
    </Modal>
  );
};
