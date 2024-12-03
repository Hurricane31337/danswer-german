"use client";

import { useRouter } from "next/navigation";
import { EnterpriseSettings } from "@/app/admin/settings/interfaces";
import { useContext, useState } from "react";
import { SettingsContext } from "@/components/settings/SettingsProvider";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import {
  BooleanFormField,
  Label,
  SubLabel,
  TextFormField,
} from "@/components/admin/connectors/Field";
import { Button } from "@/components/ui/button";
import Text from "@/components/ui/text";
import { ImageUpload } from "./ImageUpload";
import { AdvancedOptionsToggle } from "@/components/AdvancedOptionsToggle";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export function WhitelabelingForm() {
  const router = useRouter();
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [selectedLogotype, setSelectedLogotype] = useState<File | null>(null);

  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const settings = useContext(SettingsContext);
  if (!settings) {
    return null;
  }
  const enterpriseSettings = settings.enterpriseSettings;

  async function updateEnterpriseSettings(newValues: EnterpriseSettings) {
    const response = await fetch("/api/admin/enterprise-settings", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...(enterpriseSettings || {}),
        ...newValues,
      }),
    });
    if (response.ok) {
      router.refresh();
    } else {
      const errorMsg = (await response.json()).detail;
      alert(`Das Aktualisieren der Einstellungen ist fehlgeschlagen. ${errorMsg}`);
    }
  }

  return (
    <div>
      <Formik
        initialValues={{
          auto_scroll: enterpriseSettings?.auto_scroll || false,
          application_name: enterpriseSettings?.application_name || null,
          use_custom_logo: enterpriseSettings?.use_custom_logo || false,
          use_custom_logotype: enterpriseSettings?.use_custom_logotype || false,
          two_lines_for_chat_header:
            enterpriseSettings?.two_lines_for_chat_header || false,
          custom_header_content:
            enterpriseSettings?.custom_header_content || "",
          custom_popup_header: enterpriseSettings?.custom_popup_header || "",
          custom_popup_content: enterpriseSettings?.custom_popup_content || "",
          custom_lower_disclaimer_content:
            enterpriseSettings?.custom_lower_disclaimer_content || "",
          custom_nav_items: enterpriseSettings?.custom_nav_items || [],
          enable_consent_screen:
            enterpriseSettings?.enable_consent_screen || false,
        }}
        validationSchema={Yup.object().shape({
          auto_scroll: Yup.boolean().nullable(),
          application_name: Yup.string().nullable(),
          use_custom_logo: Yup.boolean().required(),
          use_custom_logotype: Yup.boolean().required(),
          custom_header_content: Yup.string().nullable(),
          two_lines_for_chat_header: Yup.boolean().nullable(),
          custom_popup_header: Yup.string().nullable(),
          custom_popup_content: Yup.string().nullable(),
          custom_lower_disclaimer_content: Yup.string().nullable(),
          enable_consent_screen: Yup.boolean().nullable(),
        })}
        onSubmit={async (values, formikHelpers) => {
          formikHelpers.setSubmitting(true);

          if (selectedLogo) {
            values.use_custom_logo = true;

            const formData = new FormData();
            formData.append("file", selectedLogo);
            setSelectedLogo(null);
            const response = await fetch(
              "/api/admin/enterprise-settings/logo",
              {
                method: "PUT",
                body: formData,
              }
            );
            if (!response.ok) {
              const errorMsg = (await response.json()).detail;
              alert(`Das Hochladen des Logos ist fehlgeschlagen. ${errorMsg}`);
              formikHelpers.setSubmitting(false);
              return;
            }
          }

          if (selectedLogotype) {
            values.use_custom_logotype = true;

            const formData = new FormData();
            formData.append("file", selectedLogotype);
            setSelectedLogotype(null);
            const response = await fetch(
              "/api/admin/enterprise-settings/logo?is_logotype=true",
              {
                method: "PUT",
                body: formData,
              }
            );
            if (!response.ok) {
              const errorMsg = (await response.json()).detail;
              alert(`Das Hochladen des Logos ist fehlgeschlagen. ${errorMsg}`);
              formikHelpers.setSubmitting(false);
              return;
            }
          }

          formikHelpers.setValues(values);
          await updateEnterpriseSettings(values);
        }}
      >
        {({ isSubmitting, values, setValues }) => (
          <Form>
            <TextFormField
              label="Anwendungsname"
              name="application_name"
              subtext={`Der benutzerdefinierte Name, den du Danswer für deine Organisation gibst. Dieser wird überall im UI 'Danswer' ersetzen.`}
              placeholder="Benutzerdefinierter Name, der 'Danswer' ersetzt"
              disabled={isSubmitting}
            />

            <Label className="mt-4">Benutzerdefiniertes Logo</Label>

            {values.use_custom_logo ? (
              <div className="mt-3">
                <SubLabel>Aktuelles benutzerdefiniertes Logo: </SubLabel>
                <img
                  src={"/api/enterprise-settings/logo?u=" + Date.now()}
                  alt="logo"
                  style={{ objectFit: "contain" }}
                  className="w-32 h-32 mb-10 mt-4"
                />

                <Button
                  variant="destructive"
                  size="sm"
                  type="button"
                  className="mb-8"
                  onClick={async () => {
                    const valuesWithoutLogo = {
                      ...values,
                      use_custom_logo: false,
                    };
                    await updateEnterpriseSettings(valuesWithoutLogo);
                    setValues(valuesWithoutLogo);
                  }}
                >
                  Löschen
                </Button>

                <SubLabel>
                  Überschreibe das aktuelle benutzerdefinierte Logo, indem du ein neues
                  Bild unten hochlädst und auf die Schaltfläche &quot;Aktualisieren&quot; klickst.
                </SubLabel>
              </div>
            ) : (
              <SubLabel>
                Gib dein eigenes Logo an, um das Standard-Danswer-Logo zu ersetzen.
              </SubLabel>
            )}

            <ImageUpload
              selectedFile={selectedLogo}
              setSelectedFile={setSelectedLogo}
            />

            <Separator />

            <AdvancedOptionsToggle
              showAdvancedOptions={showAdvancedOptions}
              setShowAdvancedOptions={setShowAdvancedOptions}
            />

            {showAdvancedOptions && (
              <div className="w-full flex flex-col gap-y-4">
                <Text>
                  Lesen Sie{" "}
                  <Link
                    href={"https://docs.danswer.dev/enterprise_edition/theming"}
                    className="text-link cursor-pointer"
                  >
                    die Dokumentation
                  </Link>{" "}
                  um White-Label-Beispiele in Aktion zu sehen.
                </Text>

                <TextFormField
                  label="Chat-Header-Inhalt"
                  name="custom_header_content"
                  subtext={`Benutzerdefinierter Markdown-Inhalt, der als Banner oben auf der Chat-Seite angezeigt wird.`}
                  placeholder="Dein Header-Inhalt..."
                  disabled={isSubmitting}
                />

                <BooleanFormField
                  name="two_lines_for_chat_header"
                  label="Zwei Zeilen für Chat-Header?"
                  subtext="Wenn aktiviert, wird der Chat-Header in zwei Zeilen statt einer angezeigt."
                />

                <Separator />

                <TextFormField
                  label={
                    values.enable_consent_screen
                      ? "Zustimmungsbildschirm-Header"
                      : "Popup-Header"
                  }
                  name="custom_popup_header"
                  subtext={
                    values.enable_consent_screen
                      ? `Der Titel des Zustimmungsbildschirms, der bei jedem Benutzer beim ersten Besuch der Anwendung angezeigt wird. Wenn leer gelassen, wird der Titel standardmäßig "Nutzungsbedingungen" verwendet.`
                      : `Der Titel für das Popup, das jedem Benutzer beim ersten Besuch der Anwendung angezeigt wird. Wenn leer gelassen UND benutzerdefinierter Popup-Inhalt angegeben ist, wird "Willkommen bei ${
                          values.application_name || "Label KI"
                        }!" verwendet.`
                  }
                  placeholder={
                    values.enable_consent_screen
                      ? "Zustimmungsbildschirm-Header"
                      : "Anfangs-Popup-Header"
                  }
                  disabled={isSubmitting}
                />

                <TextFormField
                  label={
                    values.enable_consent_screen
                      ? "Zustimmungsbildschirm-Inhalt"
                      : "Popup-Inhalt"
                  }
                  name="custom_popup_content"
                  subtext={
                    values.enable_consent_screen
                      ? `Benutzerdefinierter Markdown-Inhalt, der beim ersten Besuch der Anwendung als Zustimmungsbildschirm angezeigt wird. Wenn leer gelassen, wird standardmäßig "Durch Klicken auf 'Ich stimme zu' bestätigen Sie, dass Sie den Nutzungsbedingungen dieser Anwendung zustimmen und fortzufahren." verwendet.`
                      : `Benutzerdefinierter Markdown-Inhalt, der beim ersten Besuch der Anwendung als Popup angezeigt wird.`
                  }
                  placeholder={
                    values.enable_consent_screen
                      ? "Dein Zustimmungsbildschirm-Inhalt..."
                      : "Dein Popup-Inhalt..."
                  }
                  isTextArea
                  disabled={isSubmitting}
                />

                <BooleanFormField
                  name="enable_consent_screen"
                  label="Zustimmungsbildschirm aktivieren"
                  subtext="Wenn aktiviert, wird das anfängliche Popup in einen Zustimmungsbildschirm umgewandelt. Benutzer müssen den Bedingungen zustimmen, bevor sie beim ersten Anmelden Zugriff auf die Anwendung erhalten."
                  disabled={isSubmitting}
                />

                <TextFormField
                  label="Chat-Fußzeilentext"
                  name="custom_lower_disclaimer_content"
                  subtext={`Benutzerdefinierter Markdown-Inhalt, der am unteren Rand der Chat-Seite angezeigt wird.`}
                  placeholder="Dein Haftungsausschluss-Inhalt..."
                  isTextArea
                  disabled={isSubmitting}
                />

                <div>
                  <Label>Chat-Fußzeilen-Logotyp</Label>

                  {values.use_custom_logotype ? (
                    <div className="mt-3">
                      <SubLabel>Aktueller benutzerdefinierter Logotyp: </SubLabel>
                      <img
                        src={
                          "/api/enterprise-settings/logotype?u=" + Date.now()
                        }
                        alt="logotype"
                        style={{ objectFit: "contain" }}
                        className="w-32 h-32 mb-10 mt-4"
                      />

                      <Button
                        variant="destructive"
                        size="sm"
                        type="button"
                        className="mb-8"
                        onClick={async () => {
                          const valuesWithoutLogotype = {
                            ...values,
                            use_custom_logotype: false,
                          };
                          await updateEnterpriseSettings(valuesWithoutLogotype);
                          setValues(valuesWithoutLogotype);
                        }}
                      >
                        Löschen
                      </Button>

                      <SubLabel>
                        Überschreibe deinen hochgeladenen benutzerdefinierten Logotyp,
                        indem du unten ein neues Bild hochlädst und auf die Schaltfläche
                        &quot;Aktualisieren&quot; klickst. Dieser Logotyp ist das textbasierte
                        Logo, das unten rechts auf dem Chat-Bildschirm angezeigt wird.
                      </SubLabel>
                    </div>
                  ) : (
                    <SubLabel>
                      Füge einen benutzerdefinierten Logotyp hinzu, indem du unten
                      ein neues Bild hochlädst und auf die Schaltfläche
                      &quot;Aktualisieren&quot; klickst. Dieser Logotyp ist das textbasierte
                      Logo, das unten rechts auf dem Chat-Bildschirm angezeigt wird.
                    </SubLabel>
                  )}
                  <ImageUpload
                    selectedFile={selectedLogotype}
                    setSelectedFile={setSelectedLogotype}
                  />
                </div>
              </div>
            )}

            <Button type="submit" className="mt-4">
              Aktualisieren
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
}
