import { AdminPageTitle } from "@/components/admin/Title";

import { SettingsForm } from "./SettingsForm";
import { Text } from "@tremor/react";
import { SettingsIcon } from "@/components/icons/icons";

export default async function Page() {
  return (
    <div className="mx-auto container">
      <AdminPageTitle
        title="Workspace-Einstellungen"
        icon={<SettingsIcon size={32} className="my-auto" />}
      />

      <Text className="mb-8">
        Verwalte allgemeine Label KI-Einstellungen, die für alle Benutzer
        im Workspace gelten.
      </Text>

      <SettingsForm />
    </div>
  );
}
