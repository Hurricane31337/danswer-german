import React from "react";
import { Modal } from "@/components/Modal";
import Text from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { CloudEmbeddingProvider } from "../../../../components/embedding/interfaces";

export function DeleteCredentialsModal({
  modelProvider,
  onConfirm,
  onCancel,
}: {
  modelProvider: CloudEmbeddingProvider;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal
      width="max-w-3xl"
      title={`Delete ${modelProvider.provider_type} Credentials?`}
      onOutsideClick={onCancel}
    >
      <div className="mb-4">
        <Text className="text-lg mb-2">
          Du bist dabei, deine Anmeldeinformation für {modelProvider.provider_type}{" "}
          zu löschen. Bist du dir sicher?
        </Text>
        <Callout type="danger" title="Punkt, an dem es kein Zurück mehr gibt" className="mt-4" />
        <div className="flex mt-8 justify-between">
          <Button variant="secondary" onClick={onCancel}>
            Anmeldeinformationen behalten
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Anmeldeinformationen löschen
          </Button>
        </div>
      </div>
    </Modal>
  );
}
