"use client";

import { Button, Text } from "@tremor/react";
import { Modal } from "./Modal";
import Link from "next/link";

export function SwitchModelModal({
  embeddingModelName,
}: {
  embeddingModelName: undefined | null | string;
}) {
  return (
    <Modal className="max-w-4xl">
      <div className="text-base">
        <h2 className="text-xl font-bold mb-4 pb-2 border-b border-border flex">
          ❗ Embedding-Modell wechseln ❗
        </h2>
        <Text>
          Wir haben festgestellt, dass du unser altes Embedding-Modell nutzt (
          <i>{embeddingModelName || "thenlper/gte-small"}</i>). Wir glauben,
          dass die Suchleistung durch einen einfachen Modellwechsel enorm
          verbessert werden kann.
          <br />
          <br />
          Bitte klicke auf die Schaltfläche unten, um ein neues Modell auszuwählen.
          Keine Sorge: Die für den Wechsel notwendige Neuindizierung erfolgt im
          Hintergrund – deine Nutzung von Label KI wird nicht unterbrochen.
        </Text>

        <div className="flex mt-4">
          <Link href="/admin/models/embedding" className="w-fit mx-auto">
            <Button size="xs">Wähle dein Embedding-Modell</Button>
          </Link>
        </div>
      </div>
    </Modal>
  );
}
