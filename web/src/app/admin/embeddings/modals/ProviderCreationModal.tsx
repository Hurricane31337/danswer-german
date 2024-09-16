import React, { useRef, useState } from "react";
import { Text, Button, Callout } from "@tremor/react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Label, TextFormField } from "@/components/admin/connectors/Field";
import { LoadingAnimation } from "@/components/Loading";
import { CloudEmbeddingProvider } from "../../../../components/embedding/interfaces";
import { EMBEDDING_PROVIDERS_ADMIN_URL } from "../../configuration/llm/constants";
import { Modal } from "@/components/Modal";

export function ProviderCreationModal({
  selectedProvider,
  onConfirm,
  onCancel,
  existingProvider,
  isProxy,
}: {
  selectedProvider: CloudEmbeddingProvider;
  onConfirm: () => void;
  onCancel: () => void;
  existingProvider?: CloudEmbeddingProvider;
  isProxy?: boolean;
}) {
  const useFileUpload = selectedProvider.provider_type == "Google";

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");

  const initialValues = {
    provider_type:
      existingProvider?.provider_type || selectedProvider.provider_type,
    api_key: existingProvider?.api_key || "",
    api_url: existingProvider?.api_url || "",
    custom_config: existingProvider?.custom_config
      ? Object.entries(existingProvider.custom_config)
      : [],
    model_id: 0,
    model_name: null,
  };

  const validationSchema = Yup.object({
    provider_type: Yup.string().required("Anbieter-Typ ist erforderlich"),
    api_key: isProxy
      ? Yup.string()
      : useFileUpload
        ? Yup.string()
        : Yup.string().required("API-Schlüssel ist erforderlich"),
    model_name: isProxy
      ? Yup.string().required("Modell-Name ist erforderlich")
      : Yup.string().nullable(),
    api_url: isProxy
      ? Yup.string().required("API-URL ist erforderlich")
      : Yup.string(),
    custom_config: Yup.array().of(Yup.array().of(Yup.string()).length(2)),
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any) => void
  ) => {
    const file = event.target.files?.[0];
    setFileName("");
    if (file) {
      setFileName(file.name);
      try {
        const fileContent = await file.text();
        let jsonContent;
        try {
          jsonContent = JSON.parse(fileContent);
        } catch (parseError) {
          throw new Error(
            "Die JSON-Datei konnte nicht geparst werden. Bitte stelle sicher, dass es sich um gültiges JSON handelt."
          );
        }
        setFieldValue("api_key", JSON.stringify(jsonContent));
      } catch (error) {
        setFieldValue("api_key", "");
      }
    }
  };

  const handleSubmit = async (
    values: any,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    setIsProcessing(true);
    setErrorMsg("");
    try {
      const customConfig = Object.fromEntries(values.custom_config);

      const initialResponse = await fetch(
        "/api/admin/embedding/test-embedding",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider_type: values.provider_type.toLowerCase().split(" ")[0],
            api_key: values.api_key,
            api_url: values.api_url,
            model_name: values.model_name,
          }),
        }
      );

      if (!initialResponse.ok) {
        const errorMsg = (await initialResponse.json()).detail;
        setErrorMsg(errorMsg);
        setIsProcessing(false);
        setSubmitting(false);
        return;
      }

      const response = await fetch(EMBEDDING_PROVIDERS_ADMIN_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          provider_type: values.provider_type.toLowerCase().split(" ")[0],
          custom_config: customConfig,
          is_default_provider: false,
          is_configured: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || "Der Anbieter konnte nicht aktualisiert werden – überprüfe deinen API-Schlüssel"
        );
      }

      onConfirm();
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg("Ein unbekannter Fehler ist aufgetreten");
      }
    } finally {
      setIsProcessing(false);
      setSubmitting(false);
    }
  };

  return (
    <Modal
      width="max-w-3xl"
      title={`Configure ${selectedProvider.provider_type}`}
      onOutsideClick={onCancel}
      icon={selectedProvider.icon}
    >
      <div>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, handleSubmit, setFieldValue }) => (
            <Form onSubmit={handleSubmit} className="space-y-4">
              <Text className="text-lg mb-2">
                Du legst die Anmeldeinformationen für diesen Anbieter fest. Um
                auf diese Informationen zuzugreifen, folge den Anweisungen{" "}
                <a
                  className="cursor-pointer underline"
                  target="_blank"
                  href={selectedProvider.docsLink}
                >
                  hier
                </a>{" "}
                und hole deinen{" "}
                <a
                  className="cursor-pointer underline"
                  target="_blank"
                  href={selectedProvider.apiLink}
                >
                  {isProxy ? "API-URL" : "API-Schlüssel"}
                </a>
                ab.
              </Text>

              <div className="flex w-full flex-col gap-y-6">
                {isProxy && (
                  <>
                    <TextFormField
                      name="api_url"
                      label="API-URL"
                      placeholder="API-URL"
                      type="text"
                    />
                    <TextFormField
                      name="model_name"
                      label="Modell-Name (zum Testen)"
                      placeholder="Modell-Name"
                      type="text"
                    />
                  </>
                )}

                {useFileUpload ? (
                  <>
                    <Label>JSON-Datei hochladen</Label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={(e) => handleFileUpload(e, setFieldValue)}
                      className="text-lg w-full p-1"
                    />
                    {fileName && <p>Hochgeladene Datei: {fileName}</p>}
                  </>
                ) : (
                  <TextFormField
                    name="api_key"
                    label={`API-Schlüssel ${isProxy ? "(für nicht-lokale Umgebungen)" : ""}`}
                    placeholder="API-Schlüssel"
                    type="password"
                  />
                )}

                <a
                  href={selectedProvider.apiLink}
                  target="_blank"
                  className="underline cursor-pointer"
                >
                  Hier mehr erfahren
                </a>
              </div>

              {errorMsg && (
                <Callout title="Error" color="red">
                  {errorMsg}
                </Callout>
              )}

              <Button
                type="submit"
                color="blue"
                className="w-full"
                disabled={isSubmitting}
              >
                {isProcessing ? (
                  <LoadingAnimation />
                ) : existingProvider ? (
                  "Aktualisieren"
                ) : (
                  "Erstellen"
                )}
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </Modal>
  );
}
