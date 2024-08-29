import React from "react";
import { Modal } from "@/components/Modal";
import { Button, Text } from "@tremor/react";

import { CloudEmbeddingModel } from "../../../../components/embedding/interfaces";

export function AlreadyPickedModal({
  model,
  onClose,
}: {
  model: CloudEmbeddingModel;
  onClose: () => void;
}) {
  return (
    <Modal
      width="max-w-3xl"
      title={`${model.model_name} bereits ausgewählt`}
      onOutsideClick={onClose}
    >
      <div className="mb-4">
        <Text className="text-sm mb-2">
          Du kannst ein anderes wählen wenn du willst!
        </Text>
        <div className="flex mt-8 justify-between">
          <Button color="blue" onClick={onClose}>
            Schließen
          </Button>
        </div>
      </div>
    </Modal>
  );
}
