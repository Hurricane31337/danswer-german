import { ToolsTable } from "./ToolsTable";
import { ToolSnapshot } from "@/lib/tools/interfaces";
import { FiPlusSquare, FiTool } from "react-icons/fi";
import Link from "next/link";
import { Divider, Text, Title } from "@tremor/react";
import { fetchSS } from "@/lib/utilsSS";
import { ErrorCallout } from "@/components/ErrorCallout";
import { AdminPageTitle } from "@/components/admin/Title";
import { ToolIcon } from "@/components/icons/icons";

export default async function Page() {
  const toolResponse = await fetchSS("/tool");

  if (!toolResponse.ok) {
    return (
      <ErrorCallout
        errorTitle="Etwas ist schief gelaufen :("
        errorMsg={`Werkzeuge konnten nicht abgerufen werden - ${await toolResponse.text()}`}
      />
    );
  }

  const tools = (await toolResponse.json()) as ToolSnapshot[];

  return (
    <div className="mx-auto container">
      <AdminPageTitle
        icon={<ToolIcon size={32} className="my-auto" />}
        title="Werkzeuge"
      />

      <Text className="mb-2">
        Werkzeuge ermöglichen es den Assistenten, Informationen abzurufen oder Aktionen durchzuführen.
      </Text>

      <div>
        <Divider />

        <Title>Erstelle ein Werkzeug</Title>
        <Link
          href="/admin/tools/new"
          className="
            flex
            py-2
            px-4
            mt-2
            border
            border-border
            h-fit
            cursor-pointer
            hover:bg-hover
            text-sm
            w-40
          "
        >
          <div className="mx-auto flex">
            <FiPlusSquare className="my-auto mr-2" />
            Neues Werkzeug
          </div>
        </Link>

        <Divider />

        <Title>Bestehende Werkzeuge</Title>
        <ToolsTable tools={tools} />
      </div>
    </div>
  );
}
