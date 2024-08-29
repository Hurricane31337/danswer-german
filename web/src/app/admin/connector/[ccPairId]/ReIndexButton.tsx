"use client";

import { PopupSpec, usePopup } from "@/components/admin/connectors/Popup";
import { runConnector } from "@/lib/connector";
import { Button, Divider, Text } from "@tremor/react";
import { mutate } from "swr";
import { buildCCPairInfoUrl } from "./lib";
import { useState } from "react";
import { Modal } from "@/components/Modal";

function ReIndexPopup({
  connectorId,
  credentialId,
  ccPairId,
  setPopup,
  hide,
}: {
  connectorId: number;
  credentialId: number;
  ccPairId: number;
  setPopup: (popupSpec: PopupSpec | null) => void;
  hide: () => void;
}) {
  async function triggerIndexing(fromBeginning: boolean) {
    const errorMsg = await runConnector(
      connectorId,
      [credentialId],
      fromBeginning
    );
    if (errorMsg) {
      setPopup({
        message: errorMsg,
        type: "error",
      });
    } else {
      setPopup({
        message: "Anbindungsindizierung ausgelöst",
        type: "success",
      });
    }
    mutate(buildCCPairInfoUrl(ccPairId));
  }

  return (
    <Modal title="Indizierung ausführen" onOutsideClick={hide}>
      <div>
        <Button
          className="ml-auto"
          color="green"
          size="xs"
          onClick={() => {
            triggerIndexing(false);
            hide();
          }}
        >
          Aktualisierung ausführen
        </Button>

        <Text className="mt-2">
          Dadurch werden alle Dokumente, die sich seit dem letzten
          erfolgreichen Indizierungslauf geändert und/oder hinzugefügt haben,
          abgerufen und indiziert.
        </Text>

        <Divider />

        <Button
          className="ml-auto"
          color="green"
          size="xs"
          onClick={() => {
            triggerIndexing(true);
            hide();
          }}
        >
          Komplette Neuindizierung ausführen
        </Button>

        <Text className="mt-2">
          Dadurch wird eine vollständige Neuindizierung aller Dokumente aus
          der Quelle durchgeführt.
        </Text>

        <Text className="mt-2">
          <b>HINWEIS:</b> Abhängig von der Anzahl der in der Quelle
          gespeicherten Dokumente kann dies lange dauern.
        </Text>
      </div>
    </Modal>
  );
}

export function ReIndexButton({
  ccPairId,
  connectorId,
  credentialId,
  isDisabled,
  isDeleting,
}: {
  ccPairId: number;
  connectorId: number;
  credentialId: number;
  isDisabled: boolean;
  isDeleting: boolean;
}) {
  const { popup, setPopup } = usePopup();
  const [reIndexPopupVisible, setReIndexPopupVisible] = useState(false);

  return (
    <>
      {reIndexPopupVisible && (
        <ReIndexPopup
          connectorId={connectorId}
          credentialId={credentialId}
          ccPairId={ccPairId}
          setPopup={setPopup}
          hide={() => setReIndexPopupVisible(false)}
        />
      )}
      {popup}
      <Button
        className="ml-auto"
        color="green"
        size="xs"
        onClick={() => {
          setReIndexPopupVisible(true);
        }}
        disabled={isDisabled || isDeleting}
        tooltip={
          isDeleting
            ? "Während der die Anbindung löscht, ist keine Indizierung möglich"
            : isDisabled
              ? "Die Anbindung muss vor der Indizierung erneut aktiviert werden"
              : undefined
        }
      >
        Indizieren
      </Button>
    </>
  );
}
