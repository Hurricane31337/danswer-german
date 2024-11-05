"use client";

import { LoadingAnimation } from "@/components/Loading";
import { NotebookIcon } from "@/components/icons/icons";
import { CCPairIndexingStatusTable } from "./CCPairIndexingStatusTable";
import { AdminPageTitle } from "@/components/admin/Title";
import Link from "next/link";
import Text from "@/components/ui/text";
import { useConnectorCredentialIndexingStatus } from "@/lib/hooks";
import { usePopupFromQuery } from "@/components/popup/PopupFromQuery";
import { Button } from "@/components/ui/button";

function Main() {
  const {
    data: indexAttemptData,
    isLoading: indexAttemptIsLoading,
    error: indexAttemptError,
  } = useConnectorCredentialIndexingStatus();
  const {
    data: editableIndexAttemptData,
    isLoading: editableIndexAttemptIsLoading,
    error: editableIndexAttemptError,
  } = useConnectorCredentialIndexingStatus(undefined, true);

  if (indexAttemptIsLoading || editableIndexAttemptIsLoading) {
    return <LoadingAnimation text="" />;
  }

  if (
    indexAttemptError ||
    !indexAttemptData ||
    editableIndexAttemptError ||
    !editableIndexAttemptData
  ) {
    return (
      <div className="text-error">
        {indexAttemptError?.info?.detail ||
          editableIndexAttemptError?.info?.detail ||
          "Fehler beim Laden des Indizierungsverlaufs."}
      </div>
    );
  }

  if (indexAttemptData.length === 0) {
    return (
      <Text>
        Scheint, als hättest du noch keine Anbindungen eingerichtet. Besuche die
        Seite{" "}
        <Link className="text-link" href="/admin/add-connector">
          Anbindung hinzufügen
        </Link>{" "}
        um loszulegen!
      </Text>
    );
  }

  // sort by source name
  indexAttemptData.sort((a, b) => {
    if (a.connector.source < b.connector.source) {
      return -1;
    } else if (a.connector.source > b.connector.source) {
      return 1;
    } else {
      return 0;
    }
  });

  return (
    <CCPairIndexingStatusTable
      ccPairsIndexingStatuses={indexAttemptData}
      editableCcPairsIndexingStatuses={editableIndexAttemptData}
    />
  );
}

export default function Status() {
  const { popup } = usePopupFromQuery({
    "connector-created": {
      message: "Connector created successfully",
      type: "success",
    },
    "connector-deleted": {
      message: "Connector deleted successfully",
      type: "success",
    },
  });

  return (
    <div className="mx-auto container">
      {popup}
      <AdminPageTitle
        icon={<NotebookIcon size={32} />}
        title="Bestehende Anbindungen"
        farRightElement={
          <Link href="/admin/add-connector">
            <Button variant="success-reverse">Anbindung hinzufügen</Button>
          </Link>
        }
      />

      <Main />
    </div>
  );
}
