import { ThreeDotsLoader } from "@/components/Loading";
import { Modal } from "@/components/Modal";
import { errorHandlingFetcher } from "@/lib/fetcher";
import {
  ConnectorIndexingStatus,
  FailedConnectorIndexingStatus,
  ValidStatuses,
} from "@/lib/types";
import { Button, Text, Title } from "@tremor/react";
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
import { PopupSpec, usePopup } from "@/components/admin/connectors/Popup";

export default function UpgradingPage({
  futureEmbeddingModel,
}: {
  futureEmbeddingModel: CloudEmbeddingModel | HostedEmbeddingModel;
}) {
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  const { setPopup, popup } = usePopup();
  const { data: connectors } = useSWR<Connector<any>[]>(
    "/api/manage/connector",
    errorHandlingFetcher,
    { refreshInterval: 5000 } // 5 seconds
  );

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
        `Wechsel des Embedding-Modells konnte nicht abgebrochen werden – ${await response.text()}`
      );
    }
    setIsCancelling(false);
  };
  const statusOrder: Record<ValidStatuses, number> = {
    failed: 0,
    completed_with_errors: 1,
    not_started: 2,
    in_progress: 3,
    success: 4,
  };

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

  if (!failedIndexingStatus) {
    return <div>No failed index attempts</div>;
  }

  return (
    <>
      {popup}
      {isCancelling && (
        <Modal
          onOutsideClick={() => setIsCancelling(false)}
          title="Wechsel des Embedding-Modells abbrechen"
        >
          <div>
            <div>
              Bist du sicher, dass du abbrechen willst?
              <br />
              <br />
              Beim Abbruch wird das vorherige Modell wiederhergestellt und alle
              Fortschritte gehen verloren.
            </div>
            <div className="flex">
              <Button onClick={onCancel} className="mt-3 mx-auto" color="green">
                Bestätigen
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {futureEmbeddingModel && connectors && connectors.length > 0 && (
        <div>
          <Title className="mt-8">Aktueller Stand der Aktualisierung</Title>
          <div className="mt-4">
            <div className="italic text-lg mb-2">
              Aktuell beim Wechseln zu:{" "}
              {futureEmbeddingModel.model_name}
            </div>

            <Button
              color="red"
              size="xs"
              className="mt-4"
              onClick={() => setIsCancelling(true)}
            >
              Abbrechen
            </Button>
            {failedIndexingStatus.length > 0 && (
              <FailedReIndexAttempts
                failedIndexingStatuses={failedIndexingStatus}
                setPopup={setPopup}
              />
            )}

            <Text className="my-4">
              Die folgende Tabelle zeigt den Neuindizierungsfortschritt aller
              vorhandenen Anbindungen. Sobald alle Anbindungen erfolgreich
              reindiziert wurden, wird das neue Modell für alle Suchanfragen
              verwendet. Bis dahin werden wir wir das alte Modell nutzen, sodass
              während der Umstellung keine Ausfallzeiten entstehen.
            </Text>

            {isLoadingOngoingReIndexingStatus ? (
              <ThreeDotsLoader />
            ) : sortedReindexingProgress ? (
              <ReindexingProgressTable
                reindexingProgress={sortedReindexingProgress}
              />
            ) : (
              <ErrorCallout errorTitle="Fortschritt der Neuindizierung konnte nicht abgerufen werden" />
            )}
          </div>
        </div>
      )}
    </>
  );
}
