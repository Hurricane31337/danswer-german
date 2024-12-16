"use client";

import { Button } from "@/components/ui/button";
import Text from "@/components/ui/text";
import Title from "@/components/ui/title";
import { ModelSelector } from "../../../../components/embedding/ModelSelector";
import {
  AVAILABLE_MODELS,
  CloudEmbeddingModel,
  HostedEmbeddingModel,
} from "../../../../components/embedding/interfaces";
import { CustomModelForm } from "../../../../components/embedding/CustomModelForm";
import { useState } from "react";
import CardSection from "@/components/admin/CardSection";
export default function OpenEmbeddingPage({
  onSelectOpenSource,
  selectedProvider,
}: {
  onSelectOpenSource: (model: HostedEmbeddingModel) => Promise<void>;
  selectedProvider: HostedEmbeddingModel | CloudEmbeddingModel;
}) {
  const [configureModel, setConfigureModel] = useState(false);
  return (
    <div>
      <Title className="mt-8">
        Hier sind einige lokal gehostete Modelle, aus denen du wählen kannst.
      </Title>
      <Text className="mb-4">
        Diese Modelle können ohne API-Schlüssel verwendet werden und können eine
        GPU für schnellere Inferenz nutzen.
      </Text>
      <ModelSelector
        modelOptions={AVAILABLE_MODELS}
        setSelectedModel={onSelectOpenSource}
        currentEmbeddingModel={selectedProvider}
      />

      <Text className="mt-6">
        Alternativ kannst du (wenn du weißt, was du tust) ein{" "}
        <a
          target="_blank"
          href="https://www.sbert.net/"
          className="text-link"
          rel="noreferrer"
        >
          SentenceTransformers
        </a>
        -kompatibles Modell deiner Wahl unten angeben. Die grobe Liste der
        unterstützten Modelle findest du{" "}
        <a
          target="_blank"
          href="https://huggingface.co/models?library=sentence-transformers&sort=trending"
          className="text-link"
          rel="noreferrer"
        >
          hier
        </a>
        .
        <br />
        <b>HINWEIS:</b> Nicht alle aufgeführten Modelle funktionieren mit Onyx,
        da einige einzigartige Schnittstellen oder spezielle Anforderungen
        haben. Im Zweifelsfall wende dich an das Onyx-Team.
      </Text>
      {!configureModel && (
        <Button
          onClick={() => setConfigureModel(true)}
          className="mt-4"
          variant="secondary"
        >
          Konfiguriere benutzerdefiniertes Modell
        </Button>
      )}
      {configureModel && (
        <div className="w-full flex">
          <CardSection className="mt-4 2xl:w-4/6 mx-auto">
            <CustomModelForm onSubmit={onSelectOpenSource} />
          </CardSection>
        </div>
      )}
    </div>
  );
}
