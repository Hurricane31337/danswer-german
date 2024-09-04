import React, { useRef, useState } from "react";
import { Modal } from "@/components/Modal";
import { Button, Text, Callout, Subtitle, Divider } from "@tremor/react";
import { Label, TextFormField } from "@/components/admin/connectors/Field";
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
}: {
  provider: CloudEmbeddingProvider;
  onConfirm: () => void;
  onCancel: () => void;
  onDeleted: () => void;
  useFileUpload: boolean;
  isProxy?: boolean;
}) {
  const [apiKeyOrUrl, setApiKeyOrUrl] = useState("");
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
          setApiKeyOrUrl(JSON.stringify(jsonContent));
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
        setApiKeyOrUrl("");
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
    try {
      const testResponse = await fetch("/api/admin/embedding/test-embedding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider_type: provider.provider_type.toLowerCase().split(" ")[0],
          [isProxy ? "api_url" : "api_key"]: apiKeyOrUrl,
          [isProxy ? "api_key" : "api_url"]: isProxy
            ? provider.api_key
            : provider.api_url,
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
          provider_type: provider.provider_type.toLowerCase().split(" ")[0],
          [isProxy ? "api_url" : "api_key"]: apiKeyOrUrl,
          is_default_provider: false,
          is_configured: true,
        }),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(
          errorData.detail ||
            `Failed to update provider- check your ${isProxy ? "API URL" : "API key"}`
        );
      }

      onConfirm();
    } catch (error) {
      setTestError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    }
  };

  return (
    <Modal
      width="max-w-3xl"
      icon={provider.icon}
      title={`Modify your ${provider.provider_type} ${isProxy ? "URL" : "key"}`}
      onOutsideClick={onCancel}
    >
      <div className="mb-4">
        <Subtitle className="font-bold text-lg">
          Möchtest du {isProxy ? "deine URL" : "deinen Schlüssel"} austauschen?
        </Subtitle>
        <a
          href={provider.apiLink}
          target="_blank"
          rel="noopener noreferrer"
          className="underline cursor-pointer mt-2 mb-4"
        >
          API besuchen
        </a>

        <div className="flex flex-col mt-4 gap-y-2">
          {useFileUpload ? (
            <>
              <Label>JSON-Datei hochladen</Label>
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
                value={apiKeyOrUrl}
                onChange={(e: any) => setApiKeyOrUrl(e.target.value)}
                placeholder="Füge ${isProxy ? "deine API-URL" : "deinen API-Schlüssel"} hier ein"
              />
            </>
          )}
        </div>

        {testError && (
          <Callout title="Fehler" color="red" className="mt-4">
            {testError}
          </Callout>
        )}

        <div className="flex mt-4 justify-between">
          <Button
            color="blue"
            onClick={() => handleSubmit()}
            disabled={!apiKeyOrUrl}
          >
            {isProxy ? "URL" : "Schlüssel"} wechseln
          </Button>
        </div>
        <Divider />

        <Subtitle className="mt-4 font-bold text-lg mb-2">
          Du kannst {isProxy ? "deine URL" : "deinen Schlüssel"} auch löschen.
        </Subtitle>
        <Text className="mb-2">
          Das ist nur möglich, wenn du schon auf eine andere Embedding-Art
          umgestiegen bist!
        </Text>

        <Button onClick={handleDelete} color="red">
          {isProxy ? "URL" : "Schlüssel"} löschen
        </Button>
        {deletionError && (
          <Callout title="Error" color="red" className="mt-4">
            {deletionError}
          </Callout>
        )}
      </div>
    </Modal>
  );
}
