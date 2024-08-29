"use client";

import { Modal } from "../../Modal";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CCPairBasicInfo } from "@/lib/types";
import { useRouter } from "next/navigation";

export function NoCompleteSourcesModal({
  ccPairs,
}: {
  ccPairs: CCPairBasicInfo[];
}) {
  const router = useRouter();
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (isHidden) {
    return null;
  }

  const totalDocs = ccPairs.reduce(
    (acc, ccPair) => acc + ccPair.docs_indexed,
    0
  );

  return (
    <Modal
      className="max-w-4xl"
      title="⏳ Keiner deiner Anbindungen hat bisher eine vollständige Synchronisierung durchgeführt"
      onOutsideClick={() => setIsHidden(true)}
    >
      <div className="text-sm">
        <div>
          <div>
            Du hast einige Anbindungen eingerichtet, aber noch keine davon wurde
            vollständig synchronisiert. Je nach Größe der Wissensdatenbank(en), die
            du mit Danswer verbunden hast, kann es zwischen 30 Sekunden und ein paar
            Tagen dauern, bis die initiale Synchronisierung abgeschlossen ist. Bis
            jetzt haben wir{" "}
            <b>{totalDocs}</b> Dokumente synchronisiert.
            <br />
            <br />
            Um den Status deiner synchronisierenden Anbindungen einzusehen, gehe
            zur Seite{" "}
            <Link className="text-link" href="admin/indexing/status">
              Vorhandene Anbindungen
            </Link>
            .
            <br />
            <br />
            <p
              className="text-link cursor-pointer inline"
              onClick={() => {
                setIsHidden(true);
              }}
            >
              Oder klicke hier, um fortzufahren und Fragen zur teilweise
              synchronisierten Wissensdatenbank zu stellen.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
