import { ThreeDotsLoader } from "@/components/Loading";
import { Modal } from "@/components/Modal";
import { errorHandlingFetcher } from "@/lib/fetcher";
import {
  ConnectorIndexingStatus,
  FailedConnectorIndexingStatus,
  ValidStatuses,
} from "@/lib/types";
import Text from "@/components/ui/text";
import Title from "@/components/ui/title";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import useSWR, { mutate } from "swr";
import { ReindexingProgressTable } from "../../../../components/embedding/ReindexingProgressTable";
import { ErrorCallout } from "@/components/ErrorCallout";
import {
  CloudEmbeddingModel,
  HostedEmbeddingModel,
} from "../../../../components/embedding/interfaces";
import { Connector } from "@/lib/connectors/connectors";
import { FailedReIndexAttempts } from "@/components/embedding/FailedReIndexAttempts";
import { usePopup } from "@/components/admin/connectors/Popup";

export default function UpgradingPage({
  futureEmbeddingModel,
}: {
  futureEmbeddingModel: CloudEmbeddingModel | HostedEmbeddingModel;
}) {
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  const { setPopup, popup } = usePopup();
  const { data: connectors, isLoading: isLoadingConnectors } = useSWR<
    Connector<any>[]
  >("/api/manage/connector", errorHandlingFetcher, {
    refreshInterval: 5000, // 5 seconds
  });

  const {
    data: ongoingReIndexingStatus,
    isLoading: isLoadingOngoingReIndexingStatus,
  } = useSWR<ConnectorIndexingStatus<any, any>[]>(
    "/api/manage/admin/connector/indexing-status?secondary_index=true",
    errorHandlingFetcher,
    { refreshInterval: 5000 } // 5 seconds
  );

  const { data: failedIndexingStatus } = useSWR<
    FailedConnectorIndexingStatus[]
  >(
    "/api/manage/admin/connector/failed-indexing-status?secondary_index=true",
    errorHandlingFetcher,
    { refreshInterval: 5000 } // 5 seconds
  );

  const onCancel = async () => {
    const response = await fetch("/api/search-settings/cancel-new-embedding", {
      method: "POST",
    });
    if (response.ok) {
      mutate("/api/search-settings/get-secondary-search-settings");
    } else {
      alert(
        `Fehler beim Abbrechen des Embedding-Modell-Updates - ${await response.text()}`
      );
    }
    setIsCancelling(false);
  };
  const statusOrder: Record<ValidStatuses, number> = useMemo(
    () => ({
      failed: 0,
      canceled: 1,
      completed_with_errors: 2,
      not_started: 3,
      in_progress: 4,
      success: 5,
    }),
    []
  );

  const sortedReindexingProgress = useMemo(() => {
    return [...(ongoingReIndexingStatus || [])].sort((a, b) => {
      const statusComparison =
        statusOrder[a.latest_index_attempt?.status || "not_started"] -
        statusOrder[b.latest_index_attempt?.status || "not_started"];

      if (statusComparison !== 0) {
        return statusComparison;
      }

      return (
        (a.latest_index_attempt?.id || 0) - (b.latest_index_attempt?.id || 0)
      );
    });
  }, [ongoingReIndexingStatus]);

  if (isLoadingConnectors || isLoadingOngoingReIndexingStatus) {
    return <ThreeDotsLoader />;
  }

  return (
    <>
      {popup}
      {isCancelling && (
        <Modal
          onOutsideClick={() => setIsCancelling(false)}
          title="Embedding-Modell-Wechsel abbrechen"
        >
          <div>
            <div>
              Bist du sicher, dass du abbrechen möchtest?
              <br />
              <br />
              Ein Abbruch wird zum vorherigen Modell zurückkehren und alle
              Fortschritte werden verloren gehen.
            </div>
            <div className="flex">
              <Button onClick={onCancel} variant="submit">
                Bestätigen
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {futureEmbeddingModel && (
        <div>
          <Title className="mt-8">Aktueller Upgrade-Status</Title>
          <div className="mt-4">
            <div className="italic text-lg mb-2">
              Derzeit im Prozess des Wechsels zu:{" "}
              {futureEmbeddingModel.model_name}
            </div>

            <Button
              variant="destructive"
              className="mt-4"
              onClick={() => setIsCancelling(true)}
            >
              Abbrechen
            </Button>

            {connectors && connectors.length > 0 ? (
              <>
                {failedIndexingStatus && failedIndexingStatus.length > 0 && (
                  <FailedReIndexAttempts
                    failedIndexingStatuses={failedIndexingStatus}
                    setPopup={setPopup}
                  />
                )}

                <Text className="my-4">
                  Die folgende Tabelle zeigt den Re-Indexierungsfortschritt aller
                  vorhandenen Anbindungen. Sobald alle Anbindungen erfolgreich
                  re-indexiert wurden, wird das neue Modell für alle Suchanfragen
                  verwendet. Bis dahin wird das alte Modell verwendet, damit
                  während dieser Übergangszeit keine Ausfallzeit notwendig ist.
                </Text>

                {sortedReindexingProgress ? (
                  <ReindexingProgressTable
                    reindexingProgress={sortedReindexingProgress}
                  />
                ) : (
                  <ErrorCallout errorTitle="Fehler beim Abrufen des Reindexierungsfortschritts" />
                )}
              </>
            ) : (
              <div className="mt-8 p-6 bg-background-100 border border-border-strong rounded-lg max-w-2xl">
                <h3 className="text-lg font-semibold mb-2">
                  Wechsel der Embedding-Modelle
                </h3>
                <p className="mb-4 text-text-800">
                  Du wechselst derzeit die Embedding-Modelle, aber es gibt keine
                  Anbindungen, die reindexiert werden müssen. Das bedeutet,
                  dass der Übergang schnell und nahtlos verläuft!
                </p>
                <p className="text-text-600">
                  Das neue Modell wird bald aktiv sein.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
