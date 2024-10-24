"use client";

import { ApiKeyForm } from "./ApiKeyForm";
import { Modal } from "../Modal";
import { useRouter } from "next/navigation";
import { useProviderStatus } from "../chat_search/ProviderContext";
import { PopupSpec } from "../admin/connectors/Popup";

export const ApiKeyModal = ({
  hide,
  setPopup,
}: {
  hide: () => void;
  setPopup: (popup: PopupSpec) => void;
}) => {
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
      <>
        <div className="mb-5 text-sm text-gray-700">
          Bitte gib unten einen API-Schlüssel ein, um mit der Nutzung
          der Label KI zu beginnen &ndash; du kannst ihn später jederzeit ändern.
          <br />
          Wenn du dich lieber erst einmal umsehen möchtest, kannst du
          <strong onClick={() => hide()} className="text-link cursor-pointer">
            {" "}
            diesen Schritt überspringen
          </strong>
          .
        </div>

        <ApiKeyForm
          setPopup={setPopup}
          onSuccess={() => {
            router.refresh();
            refreshProviderInfo();
            hide();
          }}
          providerOptions={providerOptions}
        />
      </>
    </Modal>
  );
};
