"use client";

import { Label, SubLabel } from "@/components/admin/connectors/Field";
import { usePopup } from "@/components/admin/connectors/Popup";
import { Title } from "@tremor/react";
import { Settings } from "./interfaces";
import { useRouter } from "next/navigation";
import { DefaultDropdown, Option } from "@/components/Dropdown";
import { useContext } from "react";
import { SettingsContext } from "@/components/settings/SettingsProvider";
import React, { useState, useEffect } from "react";
import { usePaidEnterpriseFeaturesEnabled } from "@/components/settings/usePaidEnterpriseFeaturesEnabled";
import { Button } from "@tremor/react";

function Checkbox({
  label,
  sublabel,
  checked,
  onChange,
}: {
  label: string;
  sublabel: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="flex text-sm mb-4">
      <input
        checked={checked}
        onChange={onChange}
        type="checkbox"
        className="mx-3 px-5 w-3.5 h-3.5 my-auto"
      />
      <div>
        <Label>{label}</Label>
        <SubLabel>{sublabel}</SubLabel>
      </div>
    </label>
  );
}

function Selector({
  label,
  subtext,
  options,
  selected,
  onSelect,
}: {
  label: string;
  subtext: string;
  options: Option<string>[];
  selected: string;
  onSelect: (value: string | number | null) => void;
}) {
  return (
    <div className="mb-8">
      {label && <Label>{label}</Label>}
      {subtext && <SubLabel>{subtext}</SubLabel>}

      <div className="mt-2 w-full max-w-96">
        <DefaultDropdown
          options={options}
          selected={selected}
          onSelect={onSelect}
        />
      </div>
    </div>
  );
}

function IntegerInput({
  label,
  sublabel,
  value,
  onChange,
  id,
  placeholder = "Gib eine Zahl ein", // Default placeholder if none is provided
}: {
  label: string;
  sublabel: string;
  value: number | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  id?: string;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col text-sm mb-4">
      <Label>{label}</Label>
      <SubLabel>{sublabel}</SubLabel>
      <input
        type="number"
        className="mt-1 p-2 border rounded w-full max-w-xs"
        value={value ?? ""}
        onChange={onChange}
        min="1"
        step="1"
        id={id}
        placeholder={placeholder}
      />
    </label>
  );
}

export function SettingsForm() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [chatRetention, setChatRetention] = useState("");
  const { popup, setPopup } = usePopup();
  const isEnterpriseEnabled = usePaidEnterpriseFeaturesEnabled();

  const combinedSettings = useContext(SettingsContext);

  useEffect(() => {
    if (combinedSettings) {
      setSettings(combinedSettings.settings);
      setChatRetention(
        combinedSettings.settings.maximum_chat_retention_days?.toString() || ""
      );
    }
  }, []);

  if (!settings) {
    return null;
  }

  async function updateSettingField(
    updateRequests: { fieldName: keyof Settings; newValue: any }[]
  ) {
    // Optimistically update the local state
    const newSettings: Settings | null = settings
      ? {
          ...settings,
          ...updateRequests.reduce((acc, { fieldName, newValue }) => {
            acc[fieldName] = newValue ?? settings[fieldName];
            return acc;
          }, {} as Partial<Settings>),
        }
      : null;
    setSettings(newSettings);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSettings),
      });

      if (!response.ok) {
        const errorMsg = (await response.json()).detail;
        throw new Error(errorMsg);
      }

      router.refresh();
      setPopup({
        message: "Einstellungen erfolgreich aktualisiert!",
        type: "success",
      });
    } catch (error) {
      // Revert the optimistic update
      setSettings(settings);
      console.error("Error updating settings:", error);
      setPopup({
        message: `Failed to update settings`,
        type: "error",
      });
    }
  }

  function handleToggleSettingsField(
    fieldName: keyof Settings,
    checked: boolean
  ) {
    const updates: { fieldName: keyof Settings; newValue: any }[] = [
      { fieldName, newValue: checked },
    ];

    // If we're disabling a page, check if we need to update the default page
    if (
      !checked &&
      (fieldName === "search_page_enabled" || fieldName === "chat_page_enabled")
    ) {
      const otherPageField =
        fieldName === "search_page_enabled"
          ? "chat_page_enabled"
          : "search_page_enabled";
      const otherPageEnabled = settings && settings[otherPageField];

      if (
        otherPageEnabled &&
        settings?.default_page ===
          (fieldName === "search_page_enabled" ? "search" : "chat")
      ) {
        updates.push({
          fieldName: "default_page",
          newValue: fieldName === "search_page_enabled" ? "chat" : "search",
        });
      }
    }

    updateSettingField(updates);
  }

  function handleSetChatRetention() {
    const newValue = chatRetention === "" ? null : parseInt(chatRetention, 10);
    updateSettingField([
      { fieldName: "maximum_chat_retention_days", newValue },
    ]);
  }

  function handleClearChatRetention() {
    setChatRetention("");
    updateSettingField([
      { fieldName: "maximum_chat_retention_days", newValue: null },
    ]);
  }

  return (
    <div>
      {popup}
      <Title className="mb-4">Sichtbarkeit der Seiten</Title>

      <Checkbox
        label="Such-Seite aktiviert?"
        sublabel="Wenn diese Einstellung eingeschaltet ist, ist die Seite „Suchen“ für alle Benutzer zugänglich und wird als Option in der oberen Navigationsleiste angezeigt. Wenn sie nicht eingeschaltet ist, ist diese Seite nicht verfügbar."
        checked={settings.search_page_enabled}
        onChange={(e) =>
          handleToggleSettingsField("search_page_enabled", e.target.checked)
        }
      />

      <Checkbox
        label="Chat-Seite aktiviert?"
        sublabel="Wenn diese Einstellung eingeschaltet ist, ist die Seite „Chat“ für alle Benutzer zugänglich und wird als Option in der oberen Navigationsleiste angezeigt. Wenn sie nicht eingeschaltet ist, ist diese Seite nicht verfügbar."
        checked={settings.chat_page_enabled}
        onChange={(e) =>
          handleToggleSettingsField("chat_page_enabled", e.target.checked)
        }
      />

      <Selector
        label="Standard-Seite"
        subtext="Die Seite, zu der die Benutzer nach der Anmeldung weitergeleitet werden. Kann nur auf eine Seite gesetzt werden, die verfügbar ist."
        options={[
          { value: "search", name: "Suche" },
          { value: "chat", name: "Chat" },
        ]}
        selected={settings.default_page}
        onSelect={(value) => {
          value &&
            updateSettingField([
              { fieldName: "default_page", newValue: value },
            ]);
        }}
      />

      {isEnterpriseEnabled && (
        <>
          <Title className="mb-4">Chat Settings</Title>
          <IntegerInput
            label="Chat-Aufbewahrung"
            sublabel="Gebe die maximale Anzahl von Tagen ein, die die Label KI Chat-Nachrichten aufbewahren soll. Wenn du dieses Feld leer lässt, löscht die Label KI die Chatnachrichten nie."
            value={chatRetention === "" ? null : Number(chatRetention)}
            onChange={(e) => {
              const numValue = parseInt(e.target.value, 10);
              if (numValue >= 1 || e.target.value === "") {
                setChatRetention(e.target.value);
              }
            }}
            id="chatRetentionInput"
            placeholder="Unbegrenzte Aufbewahrung"
          />
          <Button
            onClick={handleSetChatRetention}
            color="green"
            size="xs"
            className="mr-3"
          >
            Aufbewahrungsfrist festlegen
          </Button>
          <Button onClick={handleClearChatRetention} color="blue" size="xs">
            Alles aufbewahren
          </Button>
        </>
      )}
    </div>
  );
}
