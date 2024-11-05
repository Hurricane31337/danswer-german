import { Modal } from "@/components/Modal";
import Text from "@/components/ui/text";
import { Callout } from "@/components/ui/callout";
import { Button } from "@/components/ui/button";
import { HostedEmbeddingModel } from "../../../../components/embedding/interfaces";

export function ModelSelectionConfirmationModal({
  selectedModel,
  isCustom,
  onConfirm,
  onCancel,
}: {
  selectedModel: HostedEmbeddingModel;
  isCustom: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal
      width="max-w-3xl"
      title="Embedding-Modell aktualisieren"
      onOutsideClick={onCancel}
    >
      <div>
        <div className="mb-4">
          <Text className="text-lg mb-4">
            Du hast gewählt: <b>{selectedModel.model_name}</b>. Bist du sicher,
            dass du auf dieses Embedding-Modell aktualisieren möchtest?
          </Text>
          <Text className="text-lg mb-2">
            Wir werden alle deine Dokumente im Hintergrund neu-indizieren, sodass
            du Danswer in der Zwischenzeit wie gewohnt mit dem alten Modell
            weiternutzen kannst. Je nachdem, wie viele Dokumente du indiziert hast,
            kann dies eine Weile dauern.
          </Text>
          <Text className="text-lg mb-2">
            <i>HINWEIS:</i> Dieser Neuindizierungsprozess verbraucht mehr Ressourcen
            als normalerweise. Wenn du selbst-hostest, empfehlen wir dir, Danswer
            während dieses Vorgangs mindestens 16 GB RAM zuzuweisen.
          </Text>

          {isCustom && (
            <Callout type="warning" title="WICHTIG" className="mt-4">
              Wir haben festgestellt, dass dies ein benutzerdefiniertes
              Embedding-Modell ist. Da wir die Modell-Dateien herunterladen müssen
              um wir die Richtigkeit der Konfiguration überprüfen zu können, können
              wir dir erst mitteilen, ob die Konfiguration gültig ist, <b>nachdem</b>
              wir mit der Neuindizierung deiner Dokumente begonnen haben. Wenn ein
              Problem auftritt, wird es auf dieser Seite als Indizierungsfehler
              angezeigt, nachdem du auf Bestätigen geklickt hast.
            </Callout>
          )}

          <div className="flex mt-8">
            <Button className="mx-auto" variant="submit" onClick={onConfirm}>
              Bestätigen
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
