import React from "react";
import NumberInput from "./ConnectorInput/NumberInput";
import { TextFormField } from "@/components/admin/connectors/Field";
import { TrashIcon } from "@/components/icons/icons";

const AdvancedFormPage = () => {
  return (
    <div className="py-4 flex flex-col gap-y-6 rounded-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-text-800">
        Erweiterte Konfiguration
      </h2>

      <NumberInput
        description={`
          Überprüft alle Dokumente mit der Quelle, um diejenigen zu löschen, die nicht mehr existieren.
          Hinweis: Dieser Prozess überprüft jedes Dokument, sei also vorsichtig beim Erhöhen der Frequenz.
          Standard ist 30 Tage.
          Gib 0 ein, um das Zurückschneiden für diesen Anschluss zu deaktivieren.
        `}
        label="Zurückschneide-Frequenz (Tage)"
        name="pruneFreq"
      />

      <NumberInput
        description="Dies ist die Häufigkeit, mit der wir neue Dokumente von der Quelle abrufen (in Minuten). Wenn du 0 eingibst, werden wir niemals neue Dokumente für diesen Anschluss abrufen."
        label="Aktualisierungsfrequenz (Minuten)"
        name="refreshFreq"
      />

      <TextFormField
        type="date"
        subtext="Dokumente vor diesem Datum werden nicht abgerufen"
        optional
        label="Indexierungs-Startdatum"
        name="indexingStart"
      />
      <div className="mt-4 flex w-full mx-auto max-w-2xl justify-start">
        <button className="flex gap-x-1 bg-red-500 hover:bg-red-500/80 items-center text-white py-2.5 px-3.5 text-sm font-regular rounded ">
          <TrashIcon size={20} className="text-white" />
          <div className="w-full items-center gap-x-2 flex">Zurücksetzen</div>
        </button>
      </div>
    </div>
  );
};

export default AdvancedFormPage;
