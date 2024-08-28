"use client";

import { ThreeDotsLoader } from "@/components/Loading";
import { AdminPageTitle } from "@/components/admin/Title";
import { errorHandlingFetcher } from "@/lib/fetcher";
import { Button, Card, Text, Title } from "@tremor/react";
import useSWR from "swr";
import { ModelPreview } from "../../../../components/embedding/ModelSelector";
import {
  AVAILABLE_CLOUD_PROVIDERS,
  HostedEmbeddingModel,
  CloudEmbeddingModel,
  AVAILABLE_MODELS,
} from "@/components/embedding/interfaces";

import { ErrorCallout } from "@/components/ErrorCallout";

export interface EmbeddingDetails {
  api_key: string;
  custom_config: any;
  default_model_id?: number;
  name: string;
}
import { EmbeddingIcon } from "@/components/icons/icons";

import Link from "next/link";
import { SavedSearchSettings } from "../../embeddings/interfaces";
import UpgradingPage from "./UpgradingPage";
import { useContext } from "react";
import { SettingsContext } from "@/components/settings/SettingsProvider";

function Main() {
  const settings = useContext(SettingsContext);
  const {
    data: currentEmeddingModel,
    isLoading: isLoadingCurrentModel,
    error: currentEmeddingModelError,
  } = useSWR<CloudEmbeddingModel | HostedEmbeddingModel | null>(
    "/api/search-settings/get-current-search-settings",
    errorHandlingFetcher,
    { refreshInterval: 5000 } // 5 seconds
  );

  const { data: searchSettings, isLoading: isLoadingSearchSettings } =
    useSWR<SavedSearchSettings | null>(
      "/api/search-settings/get-current-search-settings",
      errorHandlingFetcher,
      { refreshInterval: 5000 } // 5 seconds
    );

  const {
    data: futureEmbeddingModel,
    isLoading: isLoadingFutureModel,
    error: futureEmeddingModelError,
  } = useSWR<CloudEmbeddingModel | HostedEmbeddingModel | null>(
    "/api/search-settings/get-secondary-search-settings",
    errorHandlingFetcher,
    { refreshInterval: 5000 } // 5 seconds
  );

  if (
    isLoadingCurrentModel ||
    isLoadingFutureModel ||
    isLoadingSearchSettings
  ) {
    return <ThreeDotsLoader />;
  }

  if (
    currentEmeddingModelError ||
    !currentEmeddingModel ||
    futureEmeddingModelError
  ) {
    return <ErrorCallout errorTitle="Der Status des Embedding-Modells konnte nicht abgerufen werden" />;
  }

  const currentModelName = currentEmeddingModel?.model_name;
  const AVAILABLE_CLOUD_PROVIDERS_FLATTENED = AVAILABLE_CLOUD_PROVIDERS.flatMap(
    (provider) =>
      provider.embedding_models.map((model) => ({
        ...model,
        provider_type: provider.provider_type,
        model_name: model.model_name, // Ensure model_name is set for consistency
      }))
  );

  const currentModel: CloudEmbeddingModel | HostedEmbeddingModel =
    AVAILABLE_MODELS.find((model) => model.model_name === currentModelName) ||
    AVAILABLE_CLOUD_PROVIDERS_FLATTENED.find(
      (model) => model.model_name === currentEmeddingModel.model_name
    )!;

  return (
    <div className="h-screen">
      {!futureEmbeddingModel ? (
        <>
          {settings?.settings.needs_reindexing && (
            <p className="max-w-3xl">
              Deine Sucheinstellungen sind derzeit veraltet! Wir empfehlen,
              deine Sucheinstellungen zu aktualisieren und neu zu indizieren.
            </p>
          )}
          <Title className="mb-6 mt-8 !text-2xl">Embedding-Modell</Title>

          {currentModel ? (
            <ModelPreview model={currentModel} display />
          ) : (
            <Title className="mt-8 mb-4">Wähle dein Embedding-Modell</Title>
          )}

          <Title className="mb-2 mt-8 !text-2xl">Post-processing</Title>

          <Card className="!mr-auto mt-8 !w-96">
            {searchSettings && (
              <>
                <div className="px-1 w-full rounded-lg">
                  <div className="space-y-4">
                    <div>
                      <Text className="font-semibold">Reranking-Modell</Text>
                      <Text className="text-gray-700">
                        {searchSettings.rerank_model_name || "Nicht festgelegt"}
                      </Text>
                    </div>

                    <div>
                      <Text className="font-semibold">Ergebnise zum Reranking</Text>
                      <Text className="text-gray-700">
                        {searchSettings.num_rerank}
                      </Text>
                    </div>

                    <div>
                      <Text className="font-semibold">
                        Mehrsprachige Erweiterung
                      </Text>
                      <Text className="text-gray-700">
                        {searchSettings.multilingual_expansion.length > 0
                          ? searchSettings.multilingual_expansion.join(", ")
                          : "Keine"}
                      </Text>
                    </div>

                    <div>
                      <Text className="font-semibold">Mehrstufige Indizierung</Text>
                      <Text className="text-gray-700">
                        {searchSettings.multipass_indexing
                          ? "Aktiviert"
                          : "Deaktiviert"}
                      </Text>
                    </div>

                    <div>
                      <Text className="font-semibold">
                        Reranking für Streaming deaktivieren
                      </Text>
                      <Text className="text-gray-700">
                        {searchSettings.disable_rerank_for_streaming
                          ? "Ja"
                          : "Nein"}
                      </Text>
                    </div>
                  </div>
                </div>
              </>
            )}
          </Card>

          <Link href="/admin/embeddings">
            <Button className="mt-8">Such-Einstellungen aktualisieren</Button>
          </Link>
        </>
      ) : (
        <UpgradingPage futureEmbeddingModel={futureEmbeddingModel} />
      )}
    </div>
  );
}

function Page() {
  return (
    <div className="mx-auto container">
      <AdminPageTitle
        title="Such-Einstellungen"
        icon={<EmbeddingIcon size={32} className="my-auto" />}
      />
      <Main />
    </div>
  );
}

export default Page;
