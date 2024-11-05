import React, { useRef, useState } from "react";
import { Modal } from "@/components/Modal";
import { Callout } from "@/components/ui/callout";
import Text from "@/components/ui/text";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/admin/connectors/Field";
import { CloudEmbeddingProvider } from "../../../../components/embedding/interfaces";
import {
  EMBEDDING_PROVIDERS_ADMIN_URL,
  LLM_PROVIDERS_ADMIN_URL,
} from "../../configuration/llm/constants";
import { mutate } from "swr";

export function ChangeCredentialsModal({
  provider,
  onConfirm,
  onCancel,
  onDeleted,
  useFileUpload,
  isProxy = false,
  isAzure = false,
}: {
  provider: CloudEmbeddingProvider;
  onConfirm: () => void;
  onCancel: () => void;
  onDeleted: () => void;
  useFileUpload: boolean;
  isProxy?: boolean;
  isAzure?: boolean;
}) {
  const [apiKey, setApiKey] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [modelName, setModelName] = useState("");

  const [testError, setTestError] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [deletionError, setDeletionError] = useState<string>("");

  const clearFileInput = () => {
    setFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    setFileName("");

    if (file) {
      setFileName(file.name);
      try {
        setDeletionError("");
        const fileContent = await file.text();
        let jsonContent;
        try {
          jsonContent = JSON.parse(fileContent);
          setApiKey(JSON.stringify(jsonContent));
        } catch (parseError) {
          throw new Error(
            "Die JSON-Datei konnte nicht geparst werden. Bitte stelle sicher, dass es sich um gültiges JSON handelt."
          );
        }
      } catch (error) {
        setTestError(
          error instanceof Error
            ? error.message
            : "Beim Verarbeiten der Datei ist ein unbekannter Fehler aufgetreten."
        );
        setApiKey("");
        clearFileInput();
      }
    }
  };

  const handleDelete = async () => {
    setDeletionError("");
    setIsProcessing(true);

    try {
      const response = await fetch(
        `${EMBEDDING_PROVIDERS_ADMIN_URL}/${provider.provider_type.toLowerCase()}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setDeletionError(errorData.detail);
        return;
      }

      mutate(LLM_PROVIDERS_ADMIN_URL);
      onDeleted();
    } catch (error) {
      setDeletionError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async () => {
    setTestError("");
    const normalizedProviderType = provider.provider_type
      .toLowerCase()
      .split(" ")[0];
    try {
      const testResponse = await fetch("/api/admin/embedding/test-embedding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider_type: normalizedProviderType,
          api_key: apiKey,
          api_url: apiUrl,
          model_name: modelName,
        }),
      });

      if (!testResponse.ok) {
        const errorMsg = (await testResponse.json()).detail;
        throw new Error(errorMsg);
      }

      const updateResponse = await fetch(EMBEDDING_PROVIDERS_ADMIN_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider_type: normalizedProviderType,
          api_key: apiKey,
          api_url: apiUrl,
          is_default_provider: false,
          is_configured: true,
        }),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(
          errorData.detail ||
            `Ändern des Anbieters fehlgeschlagen – prüfe ${
              isProxy ? "deine API-URL" : "deinen API-Schlüssel"
            }`
        );
      }

      onConfirm();
    } catch (error) {
      setTestError(
        error instanceof Error ? error.message : "Ein unbekannter Fehler ist aufgetreten"
      );
    }
  };
  return (
    <Modal
      width="max-w-3xl"
      icon={provider.icon}
      title={`Ändere ${provider.provider_type} ${
        isProxy ? "deine URL" : "deinen Schlüssel"
      }`}
      onOutsideClick={onCancel}
    >
      <>
        {!isAzure && (
          <>
            <p className="mb-4">
              Du kannst deine Konfiguration ändern, indem du einen neuen API-Schlüssel {isProxy ? " oder eine neue API-URL" : ""} angibst.
            </p>

            <div className="mb-4 flex flex-col gap-y-2">
              <Label className="mt-2">API-Schlüssel</Label>
              {useFileUpload ? (
                <>
                  <Label className="mt-2">JSON-Datei hochladen</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="text-lg w-full p-1"
                  />
                  {fileName && <p>Hochgeladene Datei: {fileName}</p>}
                </>
              ) : (
                <>
                  <input
                    className={`
                        border 
                        border-border 
                        rounded 
                        w-full 
                        py-2 
                        px-3 
                        bg-background-emphasis
                    `}
                    value={apiKey}
                    onChange={(e: any) => setApiKey(e.target.value)}
                    placeholder="API-URL hier einfügen"
                  />
                </>
              )}

              {isProxy && (
                <>
                  <Label className="mt-2">API-URL</Label>

                  <input
                    className={`
                        border 
                        border-border 
                        rounded 
                        w-full 
                        py-2 
                        px-3 
                        bg-background-emphasis
                    `}
                    value={apiUrl}
                    onChange={(e: any) => setApiUrl(e.target.value)}
                    placeholder="API-Schlüssel hier einfügen"
                  />

                  {deletionError && (
                    <Callout type="danger" title="Fehler" className="mt-4">
                      {deletionError}
                    </Callout>
                  )}

                  <div>
                    <Label className="mt-2">Test Model</Label>
                    <p>
                      Da du einen liteLLM-Proxy verwendest, benötigen wir einen
                      Modellnamen, mit dem wir die Verbindung testen können.
                    </p>
                  </div>
                  <input
                    className={`
                     border 
                     border-border 
                     rounded 
                     w-full 
                     py-2 
                     px-3 
                     bg-background-emphasis
                 `}
                    value={modelName}
                    onChange={(e: any) => setModelName(e.target.value)}
                    placeholder="Modellnamen hier einfügen"
                  />
                </>
              )}

              {testError && (
                <Callout type="danger" title="Fehler" className="my-4">
                  {testError}
                </Callout>
              )}

              <Button
                className="mr-auto mt-4"
                variant="submit"
                onClick={() => handleSubmit()}
                disabled={!apiKey}
              >
                Konfiguration aktualisieren
              </Button>

              <Separator />
            </div>
          </>
        )}

          <Text className="mt-4 font-bold text-lg mb-2">
            Du kannst deine Konfiguration auch löschen.
          </Text>
          <Text className="mb-2">
            Das ist nur möglich, wenn du schon auf eine andere Embedding-Art
            umgestiegen bist!
          </Text>

        <Button
          className="mr-auto"
          onClick={handleDelete}
          variant="destructive"
        >
          Konfiguration löschen
        </Button>
        {deletionError && (
          <Callout type="danger" title="Fehler" className="mt-4">
            {deletionError}
          </Callout>
        )}
      </>
    </Modal>
  );
}
