import { LoadingAnimation } from "@/components/Loading";
import Text from "@/components/ui/text";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { AdvancedOptionsToggle } from "@/components/AdvancedOptionsToggle";
import {
  ArrayHelpers,
  ErrorMessage,
  Field,
  FieldArray,
  Form,
  Formik,
} from "formik";
import { FiPlus, FiTrash, FiX } from "react-icons/fi";
import { LLM_PROVIDERS_ADMIN_URL } from "./constants";
import {
  Label,
  SubLabel,
  TextArrayField,
  TextFormField,
} from "@/components/admin/connectors/Field";
import { useState } from "react";
import { useSWRConfig } from "swr";
import { FullLLMProvider } from "./interfaces";
import { PopupSpec } from "@/components/admin/connectors/Popup";
import * as Yup from "yup";
import isEqual from "lodash/isEqual";
import { IsPublicGroupSelector } from "@/components/IsPublicGroupSelector";

function customConfigProcessing(customConfigsList: [string, string][]) {
  const customConfig: { [key: string]: string } = {};
  customConfigsList.forEach(([key, value]) => {
    customConfig[key] = value;
  });
  return customConfig;
}

export function CustomLLMProviderUpdateForm({
  onClose,
  existingLlmProvider,
  shouldMarkAsDefault,
  setPopup,
  hideSuccess,
}: {
  onClose: () => void;
  existingLlmProvider?: FullLLMProvider;
  shouldMarkAsDefault?: boolean;
  setPopup?: (popup: PopupSpec) => void;
  hideSuccess?: boolean;
}) {
  const { mutate } = useSWRConfig();

  const [isTesting, setIsTesting] = useState(false);
  const [testError, setTestError] = useState<string>("");

  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Define the initial values based on the provider's requirements
  const initialValues = {
    name: existingLlmProvider?.name ?? "",
    provider: existingLlmProvider?.provider ?? "",
    api_key: existingLlmProvider?.api_key ?? "",
    api_base: existingLlmProvider?.api_base ?? "",
    api_version: existingLlmProvider?.api_version ?? "",
    default_model_name: existingLlmProvider?.default_model_name ?? null,
    fast_default_model_name:
      existingLlmProvider?.fast_default_model_name ?? null,
    model_names: existingLlmProvider?.model_names ?? [],
    custom_config_list: existingLlmProvider?.custom_config
      ? Object.entries(existingLlmProvider.custom_config)
      : [],
    is_public: existingLlmProvider?.is_public ?? true,
    groups: existingLlmProvider?.groups ?? [],
    deployment_name: existingLlmProvider?.deployment_name ?? null,
  };

  // Setup validation schema if required
  const validationSchema = Yup.object({
    name: Yup.string().required("Display Name is required"),
    provider: Yup.string().required("Provider Name is required"),
    api_key: Yup.string(),
    api_base: Yup.string(),
    api_version: Yup.string(),
    model_names: Yup.array(Yup.string().required("Model name is required")),
    default_model_name: Yup.string().required("Model name is required"),
    fast_default_model_name: Yup.string().nullable(),
    custom_config_list: Yup.array(),
    // EE Only
    is_public: Yup.boolean().required(),
    groups: Yup.array().of(Yup.number()),
    deployment_name: Yup.string().nullable(),
  });

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={async (values, { setSubmitting }) => {
        setSubmitting(true);

        if (values.model_names.length === 0) {
          const fullErrorMsg = "At least one model name is required";
          if (setPopup) {
            setPopup({
              type: "error",
              message: fullErrorMsg,
            });
          } else {
            alert(fullErrorMsg);
          }
          setSubmitting(false);
          return;
        }

        // test the configuration
        if (!isEqual(values, initialValues)) {
          setIsTesting(true);

          const response = await fetch("/api/admin/llm/test", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              custom_config: customConfigProcessing(values.custom_config_list),
              ...values,
            }),
          });
          setIsTesting(false);

          if (!response.ok) {
            const errorMsg = (await response.json()).detail;
            setTestError(errorMsg);
            return;
          }
        }

        const response = await fetch(LLM_PROVIDERS_ADMIN_URL, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...values,
            // For custom llm providers, all model names are displayed
            display_model_names: values.model_names,
            custom_config: customConfigProcessing(values.custom_config_list),
          }),
        });

        if (!response.ok) {
          const errorMsg = (await response.json()).detail;
          const fullErrorMsg = existingLlmProvider
            ? `Anbieter konnte nicht aktualisiert werden: ${errorMsg}`
            : `Anbieter konnte nicht aktiviert werden: ${errorMsg}`;
          if (setPopup) {
            setPopup({
              type: "error",
              message: fullErrorMsg,
            });
          } else {
            alert(fullErrorMsg);
          }
          return;
        }

        if (shouldMarkAsDefault) {
          const newLlmProvider = (await response.json()) as FullLLMProvider;
          const setDefaultResponse = await fetch(
            `${LLM_PROVIDERS_ADMIN_URL}/${newLlmProvider.id}/default`,
            {
              method: "POST",
            }
          );
          if (!setDefaultResponse.ok) {
            const errorMsg = (await setDefaultResponse.json()).detail;
            const fullErrorMsg = `Anbieter konnte nicht als Standard festgelegt werden: ${errorMsg}`;
            if (setPopup) {
              setPopup({
                type: "error",
                message: fullErrorMsg,
              });
            } else {
              alert(fullErrorMsg);
            }
            return;
          }
        }

        mutate(LLM_PROVIDERS_ADMIN_URL);
        onClose();

        const successMsg = existingLlmProvider
          ? "Anbieter erfolgreich aktualisiert!"
          : "Anbieter erfolgreich aktiviert!";
        if (!hideSuccess && setPopup) {
          setPopup({
            type: "success",
            message: successMsg,
          });
        } else {
          alert(successMsg);
        }

        setSubmitting(false);
      }}
    >
      {(formikProps) => {
        return (
          <Form className="gap-y-6 mt-8">
            <TextFormField
              name="name"
              label="Angezeigter Name"
              subtext="Ein Name, den du verwenden kannst, um diesen Anbieter bei der Auswahl in der Benutzeroberfläche zu identifizieren."
              placeholder="Angezeigter Name"
              disabled={existingLlmProvider ? true : false}
            />

            <TextFormField
              name="provider"
              label="Anbietername"
              subtext={
                <>
                  Sollte einer der Anbieter sein, die unter{" "}
                  <a
                    target="_blank"
                    href="https://docs.litellm.ai/docs/providers"
                    className="text-link"
                    rel="noreferrer"
                  >
                    https://docs.litellm.ai/docs/providers
                  </a>
                  {" "}aufgeführt sind.
                </>
              }
              placeholder="Name des benutzerdefinierten Anbieters"
            />

            <Separator />

            <SubLabel>
              Fülle das Folgende nach Bedarf aus. Um zu ermitteln welche Felder
              erforderlich sind, schaue in der LiteLLM-Dokumentation zum oben
              angegebenen Modell-Anbieternamen nach.
            </SubLabel>

            <TextFormField
              name="api_key"
              label="[Optional] API-Schlüssel"
              placeholder="API-Schlüssel"
              type="password"
            />

            {existingLlmProvider?.deployment_name && (
              <TextFormField
                name="deployment_name"
                label="[Optional] Deployment Name"
                placeholder="Deployment Name"
              />
            )}

            <TextFormField
              name="api_base"
              label="[Optional] API-Basis"
              placeholder="API-Basis"
            />

            <TextFormField
              name="api_version"
              label="[Optional] API-Version"
              placeholder="API-Version"
            />

            <Label>[Optional] Benutzerdefinierte Konfigurationen</Label>
            <SubLabel>
              <>
                <div>
                  Zusätzliche Konfigurationen, die vom Modellanbieter benötigt werden. Diese
                  werden über die Umgebung an litellm übergeben und als Argumente in den
                  `completion`-Aufruf übergeben.
                </div>

                <div className="mt-2">
                  Um zum Beispiel den Cloudflare-Provider zu konfigurieren, musst
                  du „CLOUDFLARE_ACCOUNT_ID“ als Schlüssel und deine
                  Cloudflare-Konto-ID als Wert angeben.
                </div>
              </>
            </SubLabel>

            <FieldArray
              name="custom_config_list"
              render={(arrayHelpers: ArrayHelpers<any[]>) => (
                <div className="w-full">
                  {formikProps.values.custom_config_list.map((_, index) => {
                    return (
                      <div
                        key={index}
                        className={(index === 0 ? "mt-2" : "mt-6") + " w-full"}
                      >
                        <div className="flex w-full">
                          <div className="w-full mr-6 border border-border p-3 rounded">
                            <div>
                              <Label>Schlüssel</Label>
                              <Field
                                name={`custom_config_list[${index}][0]`}
                                className={`
                                  border 
                                  border-border 
                                  bg-background 
                                  rounded 
                                  w-full 
                                  py-2 
                                  px-3 
                                  mr-4
                                `}
                                autoComplete="off"
                              />
                              <ErrorMessage
                                name={`custom_config_list[${index}][0]`}
                                component="div"
                                className="text-error text-sm mt-1"
                              />
                            </div>

                            <div className="mt-3">
                              <Label>Wert</Label>
                              <Field
                                name={`custom_config_list[${index}][1]`}
                                className={`
                                  border 
                                  border-border 
                                  bg-background 
                                  rounded 
                                  w-full 
                                  py-2 
                                  px-3 
                                  mr-4
                                `}
                                autoComplete="off"
                              />
                              <ErrorMessage
                                name={`custom_config_list[${index}][1]`}
                                component="div"
                                className="text-error text-sm mt-1"
                              />
                            </div>
                          </div>
                          <div className="my-auto">
                            <FiX
                              className="my-auto w-10 h-10 cursor-pointer hover:bg-hover rounded p-2"
                              onClick={() => arrayHelpers.remove(index)}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <Button
                    onClick={() => {
                      arrayHelpers.push(["", ""]);
                    }}
                    className="mt-3"
                    variant="next"
                    type="button"
                    icon={FiPlus}
                  >
                    Neu hinzufügen
                  </Button>
                </div>
              )}
            />

            <Separator />

            {!existingLlmProvider?.deployment_name && (
              <TextArrayField
                name="model_names"
                label="Model Names"
                values={formikProps.values}
                subtext={
                  <>
                    Liste die einzelnen Modelle auf, die du als Teil dieses Anbieters
                    verfügbar machen möchten. Mindestens eines muss angegeben werden.
                    Für ein optimales Erlebnis sollte dein [Anbietername]/[Modellname]
                    mit einem der{" "}
                    <a
                      target="_blank"
                      href="https://models.litellm.ai/"
                      className="text-link"
                      rel="noreferrer"
                    >
                      hier
                    </a>
                    {" "}aufgeführten Paare übereinstimmen.
                  </>
                }
              />
            )}

            <Separator />

            <TextFormField
              name="default_model_name"
              subtext={`
              Das Modell, das standardmäßig für diesen Anbieter verwendet
              wird, sofern nicht anders angegeben. Muss eines der oben
              aufgeführten Modelle sein.`}
              label="Standard-Modell"
              placeholder="Z.B. gpt-4"
            />

            {!existingLlmProvider?.deployment_name && (
              <TextFormField
                name="fast_default_model_name"
                subtext={`Das Modell, das für leichtere Abläufe wie
                „LLM Chunk Filter“ für diesen Anbieter verwendet
                wird. Wenn nicht festgelegt, wird das oben konfigurierte
                Standardmodell verwendet.`}
                label="[Optional] Schnelles Modell"
                placeholder="E.g. gpt-4"
              />
            )}

            <Separator />

            <AdvancedOptionsToggle
              showAdvancedOptions={showAdvancedOptions}
              setShowAdvancedOptions={setShowAdvancedOptions}
            />

            {showAdvancedOptions && (
              <IsPublicGroupSelector
                formikProps={formikProps}
                objectName="LLM-Anbieter"
                publicToWhom="all users"
                enforceGroupSelection={true}
              />
            )}

            <div>
              {/* NOTE: this is above the test button to make sure it's visible */}
              {testError && (
                <Text className="text-error mt-2">{testError}</Text>
              )}

              <div className="flex w-full mt-4">
                <Button type="submit" variant="submit">
                  {isTesting ? (
                    <LoadingAnimation text="Testing" />
                  ) : existingLlmProvider ? (
                    "Aktualisieren"
                  ) : (
                    "Aktivieren"
                  )}
                </Button>
                {existingLlmProvider && (
                  <Button
                    type="button"
                    variant="destructive"
                    className="ml-3"
                    icon={FiTrash}
                    onClick={async () => {
                      const response = await fetch(
                        `${LLM_PROVIDERS_ADMIN_URL}/${existingLlmProvider.id}`,
                        {
                          method: "DELETE",
                        }
                      );
                      if (!response.ok) {
                        const errorMsg = (await response.json()).detail;
                        alert(`Anbieter konnte nicht gelöscht werden: ${errorMsg}`);
                        return;
                      }

                      mutate(LLM_PROVIDERS_ADMIN_URL);
                      onClose();
                    }}
                  >
                    Löschen
                  </Button>
                )}
              </div>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
}
