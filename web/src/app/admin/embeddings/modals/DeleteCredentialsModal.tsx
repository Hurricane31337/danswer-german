import React from "react";
import { Modal } from "@/components/Modal";
import { Button, Text, Callout } from "@tremor/react";
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
        <Callout
          title="Punkt, an dem es kein Zurück mehr gibt"
          color="red"
          className="mt-4"
        ></Callout>
        <div className="flex mt-8 justify-between">
          <Button color="gray" onClick={onCancel}>
            Anmeldeinformationen behalten
          </Button>
          <Button color="red" onClick={onConfirm}>
            Anmeldeinformationen löschen
          </Button>
        </div>
      </div>
    </Modal>
  );
}
