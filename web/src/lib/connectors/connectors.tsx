import * as Yup from "yup";
import { IsPublicGroupSelectorFormType } from "@/components/IsPublicGroupSelector";
import { ConfigurableSources, ValidInputTypes, ValidSources } from "../types";
import { AccessTypeGroupSelectorFormType } from "@/components/admin/connectors/AccessTypeGroupSelector";
import { Credential } from "@/lib/connectors/credentials"; // Import Credential type

export function isLoadState(connector_name: string): boolean {
  // TODO: centralize connector metadata like this somewhere instead of hardcoding it here
  const loadStateConnectors = ["web", "xenforo", "file", "label_manual"];
  if (loadStateConnectors.includes(connector_name)) {
    return true;
  }

  return false;
}

export type InputType =
  | "list"
  | "text"
  | "select"
  | "multiselect"
  | "boolean"
  | "number"
  | "file";

export type StringWithDescription = {
  value: string;
  name: string;
  description?: string;
};

export interface Option {
  label: string | ((currentCredential: Credential<any> | null) => string);
  name: string;
  description?:
    | string
    | ((currentCredential: Credential<any> | null) => string);
  query?: string;
  optional?: boolean;
  hidden?: boolean;
  visibleCondition?: (
    values: any,
    currentCredential: Credential<any> | null
  ) => boolean;
  wrapInCollapsible?: boolean;
}

export interface SelectOption extends Option {
  type: "select";
  options?: StringWithDescription[];
  default?: string;
}

export interface ListOption extends Option {
  type: "list";
  default?: string[];
  transform?: (values: string[]) => string[];
}

export interface TextOption extends Option {
  type: "text";
  default?: string;
  isTextArea?: boolean;
}

export interface NumberOption extends Option {
  type: "number";
  default?: number;
}

export interface BooleanOption extends Option {
  type: "checkbox";
  default?: boolean;
}

export interface FileOption extends Option {
  type: "file";
  default?: string;
}

export interface StringTabOption extends Option {
  type: "string_tab";
  default?: string;
}

export interface TabOption extends Option {
  type: "tab";
  defaultTab?: string;
  tabs: {
    label: string;
    value: string;
    fields: (
      | BooleanOption
      | ListOption
      | TextOption
      | NumberOption
      | SelectOption
      | FileOption
      | StringTabOption
    )[];
  }[];
  default?: [];
}

export interface ConnectionConfiguration {
  description: string;
  subtext?: string;
  values: (
    | BooleanOption
    | ListOption
    | TextOption
    | NumberOption
    | SelectOption
    | FileOption
    | TabOption
  )[];
  advanced_values: (
    | BooleanOption
    | ListOption
    | TextOption
    | NumberOption
    | SelectOption
    | FileOption
    | TabOption
  )[];
  overrideDefaultFreq?: number;
}

export const connectorConfigs: Record<
  ConfigurableSources,
  ConnectionConfiguration
> = {
  web: {
    description: "Konfiguriere Web-Connector",
    values: [
      {
        type: "text",
        query: "Gib die Website-URL zum Scrapen ein, z.B.: https://docs.onyx.app/:",
        label: "Basis-URL",
        name: "base_url",
        optional: false,
      },
      {
        type: "select",
        query: "Wähle den Web-Connector-Typ:",
        label: "Scraping-Methode",
        name: "web_connector_type",
        options: [
          { name: "rekursiv", value: "recursive" },
          { name: "einzeln", value: "single" },
          { name: "Sitemap", value: "sitemap" },
        ],
      },
    ],
    advanced_values: [],
    overrideDefaultFreq: 60 * 60 * 24,
  },
  github: {
    description: "Konfiguriere GitHub-Connector",
    values: [
      {
        type: "text",
        query: "Gib den Repository-Besitzer ein:",
        label: "Repository-Besitzer",
        name: "repo_owner",
        optional: false,
      },
      {
        type: "text",
        query: "Gib den Repository-Namen ein:",
        label: "Repository-Name",
        name: "repo_name",
        optional: false,
      },
      {
        type: "checkbox",
        query: "Pull Requests einbeziehen?",
        label: "Pull Requests einbeziehen?",
        description: "Indexiere Pull Requests aus diesem Repository",
        name: "include_prs",
        optional: true,
      },
      {
        type: "checkbox",
        query: "Issues einbeziehen?",
        label: "Issues einbeziehen",
        name: "include_issues",
        description: "Indexiere Issues aus diesem Repository",
        optional: true,
      },
    ],
    advanced_values: [],
  },
  gitlab: {
    description: "Konfiguriere GitLab-Connector",
    values: [
      {
        type: "text",
        query: "Gib den Projektbesitzer ein:",
        label: "Projektbesitzer",
        name: "project_owner",
        optional: false,
      },
      {
        type: "text",
        query: "Gib den Projektnamen ein:",
        label: "Projektname",
        name: "project_name",
        optional: false,
      },
      {
        type: "checkbox",
        query: "Merge Requests einbeziehen?",
        label: "MRs einbeziehen",
        name: "include_mrs",
        default: true,
        hidden: true,
      },
      {
        type: "checkbox",
        query: "Issues einbeziehen?",
        label: "Issues einbeziehen",
        name: "include_issues",
        optional: true,
        hidden: true,
      },
    ],
    advanced_values: [],
  },
  google_drive: {
    description: "Konfiguriere Google-Drive-Connector",
    values: [
      {
        type: "tab",
        name: "indexing_scope",
        label: "Wie sollen wir dein Google Drive indexieren?",
        optional: true,
        tabs: [
          {
            value: "general",
            label: "General",
            fields: [
              {
                type: "checkbox",
                label: "Include shared drives?",
                description: (currentCredential) => {
                  return currentCredential?.credential_json?.google_tokens
                    ? "This will allow Onyx to index everything in the shared drives you have access to."
                    : "This will allow Onyx to index everything in your Organization's shared drives.";
                },
                name: "include_shared_drives",
                default: false,
              },
              {
                type: "checkbox",
                label: (currentCredential) => {
                  return currentCredential?.credential_json?.google_tokens
                    ? "Include My Drive?"
                    : "Include Everyone's My Drive?";
                },
                description: (currentCredential) => {
                  return currentCredential?.credential_json?.google_tokens
                    ? "This will allow Onyx to index everything in your My Drive."
                    : "This will allow Onyx to index everything in everyone's My Drives.";
                },
                name: "include_my_drives",
                default: false,
              },
              {
                type: "checkbox",
                description:
                  "This will allow Onyx to index all files shared with you.",
                label: "Include All Files Shared With You?",
                name: "include_files_shared_with_me",
                visibleCondition: (values, currentCredential) =>
                  currentCredential?.credential_json?.google_tokens,
                default: false,
              },
            ],
          },
          {
            value: "specific",
            label: "Specific",
            fields: [
              {
                type: "text",
                description: (currentCredential) => {
                  return currentCredential?.credential_json?.google_tokens
                    ? "Enter a comma separated list of the URLs for the shared drive you would like to index. You must have access to these shared drives."
                    : "Enter a comma separated list of the URLs for the shared drive you would like to index.";
                },
                label: "Shared Drive URLs",
                name: "shared_drive_urls",
                default: "",
                isTextArea: true,
              },
              {
                type: "text",
                description:
                  "Enter a comma separated list of the URLs of any folders you would like to index. The files located in these folders (and all subfolders) will be indexed.",
                label: "Folder URLs",
                name: "shared_folder_urls",
                default: "",
                isTextArea: true,
              },
              {
                type: "text",
                description:
                  "Enter a comma separated list of the emails of the users whose MyDrive you want to index.",
                label: "My Drive Emails",
                name: "my_drive_emails",
                visibleCondition: (values, currentCredential) =>
                  !currentCredential?.credential_json?.google_tokens,
                default: "",
                isTextArea: true,
              },
            ],
          },
        ],
        defaultTab: "space",
      },
    ],
    advanced_values: [],
  },
  gmail: {
    description: "Konfiguriere Gmail-Connector",
    values: [],
    advanced_values: [],
  },
  bookstack: {
    description: "Konfiguriere Bookstack-Connector",
    values: [],
    advanced_values: [],
  },
  confluence: {
    description: "Konfiguriere Confluence-Connector",
    values: [
      {
        type: "checkbox",
        query: "Ist dies eine Confluence-Cloud-Instanz?",
        label: "Ist Cloud",
        name: "is_cloud",
        optional: false,
        default: true,
        description:
          "Ankreuzen, wenn dies eine Confluence-Cloud-Instanz ist, abwählen für Confluence Server/Data Center",
      },
      {
        type: "text",
        query: "Enter the wiki base URL:",
        label: "Wiki Base URL",
        name: "wiki_base",
        optional: false,
        description:
          "The base URL of your Confluence instance (e.g., https://your-domain.atlassian.net/wiki)",
      },
      {
        type: "tab",
        name: "indexing_scope",
        label: "How Should We Index Your Confluence?",
        optional: true,
        tabs: [
          {
            value: "everything",
            label: "Everything",
            fields: [
              {
                type: "string_tab",
                label: "Everything",
                name: "everything",
                description:
                  "This connector will index all pages the provided credentials have access to!",
              },
            ],
          },
          {
            value: "space",
            label: "Space",
            fields: [
              {
                type: "text",
                query: "Enter the space:",
                label: "Space Key",
                name: "space",
                default: "",
                description: "The Confluence space key to index (e.g. `KB`).",
              },
            ],
          },
          {
            value: "page",
            label: "Page",
            fields: [
              {
                type: "text",
                query: "Enter the page ID:",
                label: "Page ID",
                name: "page_id",
                default: "",
                description: "Specific page ID to index (e.g. `131368`)",
              },
              {
                type: "checkbox",
                query: "Should index pages recursively?",
                label: "Index Recursively",
                name: "index_recursively",
                description:
                  "If this is set, we will index the page indicated by the Page ID as well as all of its children.",
                optional: false,
                default: true,
              },
            ],
          },
          {
            value: "cql",
            label: "CQL Query",
            fields: [
              {
                type: "text",
                query: "Enter the CQL query (optional):",
                label: "CQL Query",
                name: "cql_query",
                default: "",
                description:
                  "IMPORTANT: We currently only support CQL queries that return objects of type 'page'. This means all CQL queries must contain 'type=page' as the only type filter. It is also important that no filters for 'lastModified' are used as it will cause issues with our connector polling logic. We will still get all attachments and comments for the pages returned by the CQL query. Any 'lastmodified' filters will be overwritten. See https://developer.atlassian.com/server/confluence/advanced-searching-using-cql/ for more details.",
              },
            ],
          },
        ],
        defaultTab: "space",
      },
    ],
    advanced_values: [],
  },
  jira: {
    description: "Configure Jira connector",
    subtext: `Gebe einen beliebigen Link zu einer Jira-Seite unten an und klicke auf "Indexieren", um ihn zu indexieren. Basierend auf dem bereitgestellten Link werden wir das GESAMTE PROJEKT indexieren, nicht nur die angegebene Seite. Zum Beispiel: Wenn du https://onyx.atlassian.net/jira/software/projects/DAN/boards/1 angibst und auf den Index-Button klickst, wird das gesamte DAN-Jira-Projekt indexiert.`,
    values: [
      {
        type: "text",
        query: "Gib die Jira-Projekt-URL ein:",
        label: "Jira-Projekt-URL",
        name: "jira_project_url",
        optional: false,
      },
      {
        type: "list",
        query: "Gib die zu ignorierenden E-Mail-Adressen aus Kommentaren ein:",
        label: "E-Mail-Blacklist für Kommentare",
        name: "comment_email_blacklist",
        description:
          "Dies ist normalerweise nützlich, um bestimmte Bots zu ignorieren. Füge Benutzer-E-Mail-Adressen hinzu, deren Kommentare NICHT indexiert werden sollen.",
        optional: true,
      },
    ],
    advanced_values: [],
  },
  salesforce: {
    description: "Konfiguriere Salesforce-Connector",
    values: [
      {
        type: "list",
        query: "Gib angeforderte Objekte ein:",
        label: "Angeforderte Objekte",
        name: "requested_objects",
        optional: true,
        description: `Gib die Salesforce-Objekttypen an, die wir indexieren sollen. Wenn du dir unsicher bist, gib keine Objekte an und Onyx wird standardmäßig nach 'Account' indexieren.

Hinweis: Verwende die Einzahl des Objektnamens (z.B. 'Opportunity' statt 'Opportunities').`,
      },
    ],
    advanced_values: [],
  },
  sharepoint: {
    description: "Konfiguriere SharePoint-Connector",
    values: [
      {
        type: "list",
        query: "Gib SharePoint-Sites ein:",
        label: "Sites",
        name: "sites",
        optional: true,
        description: `• Wenn keine Sites angegeben sind, werden alle Sites in deiner Organisation indexiert (Sites.Read.All-Berechtigungen erforderlich).
• Angabe von 'https://onyxai.sharepoint.com/sites/support' wird beispielsweise nur Dokumente innerhalb dieser Site indexieren.
• Angabe von 'https://onyxai.sharepoint.com/sites/support/unterordner' wird beispielsweise nur Dokumente innerhalb dieses Ordners indexieren.
`,
      },
    ],
    advanced_values: [],
  },
  teams: {
    description: "Konfiguriere Teams-Connector",
    values: [
      {
        type: "list",
        query: "Gib Teams an, die einbezogen werden sollen:",
        label: "Teams",
        name: "teams",
        optional: true,
        description: `Gib 0 oder mehr Teams an, die indexiert werden sollen. Wenn du z.B. das Team 'Support' für die Organisation 'onyxai' angibst, wird es dazu führen, dass wir nur Nachrichten indexieren, die in Kanälen des 'Support'-Teams gesendet wurden. Wenn keine Teams angegeben sind, werden alle Teams in deiner Organisation indexiert.`,
      },
    ],
    advanced_values: [],
  },
  discourse: {
    description: "Konfiguriere Discourse-Connector",
    values: [
      {
        type: "text",
        query: "Gib die Basis-URL ein:",
        label: "Basis-URL",
        name: "base_url",
        optional: false,
      },
      {
        type: "list",
        query: "Gib einzuschließende Kategorien an:",
        label: "Kategorien",
        name: "categories",
        optional: true,
      },
    ],
    advanced_values: [],
  },
  axero: {
    description: "Konfiguriere Axero-Connector",
    values: [
      {
        type: "list",
        query: "Gib einzuschließende Bereiche an:",
        label: "Bereiche",
        name: "spaces",
        optional: true,
        description:
          "Gib null oder mehr Bereiche an, die indexiert werden sollen (nach den Bereichs-IDs). Wenn keine Bereichs-IDs angegeben sind, werden alle Bereiche indexiert.",
      },
    ],
    advanced_values: [],
    overrideDefaultFreq: 60 * 60 * 24,
  },
  productboard: {
    description: "Konfiguriere Productboard-Connector",
    values: [],
    advanced_values: [],
  },
  slack: {
    description: "Konfiguriere Slack-Connector",
    values: [],
    advanced_values: [
      {
        type: "list",
        query: "Gib einzuschließende Kanäle an:",
        label: "Kanäle",
        name: "channels",
        description: `Gib 0 oder mehr Kanäle an, die indexiert werden sollen. Wenn du z.B. den Kanal "support" angibst, wird das dazu führen, dass wir nur den gesamten Inhalt im Kanal "#support" indexieren. Wenn keine Kanäle angegeben sind, werden alle Kanäle in deinem Workspace indexiert.`,
        optional: true,
        // Slack Channels can only be lowercase
        transform: (values) => values.map((value) => value.toLowerCase()),
      },
      {
        type: "checkbox",
        query: "Kanal-Regex aktivieren?",
        label: "Kanal-Regex aktivieren",
        name: "channel_regex_enabled",
        description: `Wenn aktiviert, behandeln wir die oben angegebenen "Kanäle" als reguläre Ausdrücke. Die Nachrichten eines Kanals werden durch den Connector abgerufen, wenn der Name des Kanals vollständig mit einem der angegebenen regulären Ausdrücke übereinstimmt.
Beispielsweise bewirkt die Angabe von .*-support.* als "Kanal", dass der Connector alle Kanäle mit "-support" im Namen einbezieht.`,
        optional: true,
      },
    ],
  },
  slab: {
    description: "Konfiguriere Slab-Connector",
    values: [
      {
        type: "text",
        query: "Gib die Basis-URL ein:",
        label: "Basis-URL",
        name: "base_url",
        optional: false,
        description: `Gib die Basis-URL für dein Slab-Team an. Dies sieht aus wie: https://onyx.slab.com/`,
      },
    ],
    advanced_values: [],
  },
  guru: {
    description: "Konfiguriere Guru-Connector",
    values: [],
    advanced_values: [],
  },
  gong: {
    description: "Konfiguriere Gong-Connector",
    values: [
      {
        type: "list",
        query: "Gib einzuschließende Workspaces an:",
        label: "Workspaces",
        name: "workspaces",
        optional: true,
        description:
          "Gib null oder mehr Arbeitsbereiche an, die indexiert werden sollen. Gib die Arbeitsbereichs-ID oder den EXAKTEN Arbeitsbereichs-Namen aus Gong an. Wenn keine Arbeitsbereiche angegeben sind, werden Transkripte aus allen Arbeitsbereichen indexiert.",
      },
    ],
    advanced_values: [],
  },
  loopio: {
    description: "Konfiguriere Loopio-Connector",
    values: [
      {
        type: "text",
        query: "Gib den Namen des Loopio-Stacks ein",
        label: "Loopio Stack Name",
        name: "loopio_stack_name",
        description:
          "Muss genau mit dem Namen in der Bibliotheksverwaltung übereinstimmen, lass dies leer, wenn du alle Stacks indexieren möchtest",
        optional: true,
      },
    ],
    advanced_values: [],
    overrideDefaultFreq: 60 * 60 * 24,
  },
  file: {
    description: "Konfiguriere Datei-Connector",
    values: [
      {
        type: "file",
        query: "Gib Dateipfade ein:",
        label: "Dateipfade",
        name: "file_locations",
        optional: false,
      },
    ],
    advanced_values: [],
  },
  zulip: {
    description: "Konfiguriere Zulip-Connector",
    values: [
      {
        type: "text",
        query: "Gib den Bereichsnamen ein",
        label: "Bereichsname",
        name: "realm_name",
        optional: false,
      },
      {
        type: "text",
        query: "Gib die Bereichs-URL ein",
        label: "Bereichs-URL",
        name: "realm_url",
        optional: false,
      },
    ],
    advanced_values: [],
  },
  notion: {
    description: "Konfiguriere Notion-Connector",
    values: [
      {
        type: "text",
        query: "Gib die ID der Root-Seite ein",
        label: "ID der Root-Seite",
        name: "root_page_id",
        optional: true,
        description:
          "Wenn angegeben, wird nur die angegebene Seite + alle zugehörigen Unterseiten indexiert. Wenn leer gelassen, werden alle Seiten indexiert, auf die die Integration Zugriff hat.",
      },
    ],
    advanced_values: [],
  },
  hubspot: {
    description: "Konfiguriere HubSpot-Connector",
    values: [],
    advanced_values: [],
  },
  document360: {
    description: "Konfiguriere Document360-Connector",
    values: [
      {
        type: "text",
        query: "Gib den Workspace ein",
        label: "Workspace",
        name: "workspace",
        optional: false,
      },
      {
        type: "list",
        query: "Gib einzuschließende Kategorien an",
        label: "Kategorien",
        name: "categories",
        optional: true,
        description:
          "Gib null oder mehr Kategorien an, die indexiert werden sollen. Zum Beispiel bewirkt die Angabe der Kategorie 'Hilfe', dass wir nur den gesamten Inhalt der Kategorie 'Hilfe' indexieren. Wenn keine Kategorien angegeben sind, werden alle Kategorien in deinem Workspace indexiert.",
      },
    ],
    advanced_values: [],
  },
  clickup: {
    description: "Konfiguriere ClickUp-Connector",
    values: [
      {
        type: "select",
        query: "Wähle den Connector-Typ:",
        label: "Connector-Typ",
        name: "connector_type",
        optional: false,
        options: [
          { name: "list", value: "list" },
          { name: "folder", value: "folder" },
          { name: "space", value: "space" },
          { name: "workspace", value: "workspace" },
        ],
      },
      {
        type: "list",
        query: "Gib Connector-IDs ein:",
        label: "Connector-IDs",
        name: "connector_ids",
        description: "Gib null oder mehr IDs an, die indexiert werden sollen.",
        optional: true,
      },
      {
        type: "checkbox",
        query: "Aufgabenskommentare abrufen?",
        label: "Aufgabenskommentare abrufen",
        name: "retrieve_task_comments",
        description:
          "Wenn aktiviert, werden alle Kommentare für jede Aufgabe ebenfalls abgerufen und indexiert.",
        optional: false,
      },
    ],
    advanced_values: [],
  },
  google_sites: {
    description: "Konfiguriere Google Sites-Connector",
    values: [
      {
        type: "file",
        query: "Gib den ZIP-Pfad ein:",
        label: "Datei-Orte",
        name: "file_locations",
        optional: false,
        description:
          "Lade eine ZIP-Datei mit dem HTML deiner Google-Site hoch",
      },
      {
        type: "text",
        query: "Gib die Basis-URL ein:",
        label: "Basis-URL",
        name: "base_url",
        optional: false,
      },
    ],
    advanced_values: [],
  },
  zendesk: {
    description: "Konfiguriere Zendesk-Connector",
    values: [
      {
        type: "select",
        query: "Wähle, welchen Inhalt dieser Connector indexieren wird:",
        label: "Inhaltstyp",
        name: "content_type",
        optional: false,
        options: [
          { name: "Artikel", value: "articles" },
          { name: "Tickets", value: "tickets" },
        ],
        default: "articles",
      },
    ],
    advanced_values: [],
  },
  linear: {
    description: "Konfiguriere Dropbox-Connector",
    values: [],
    advanced_values: [],
  },
  dropbox: {
    description: "Konfiguriere Dropbox-Connector",
    values: [],
    advanced_values: [],
  },
  s3: {
    description: "Konfiguriere S3-Connector",
    values: [
      {
        type: "text",
        query: "Gib den Bucket-Namen ein:",
        label: "Bucket-Name",
        name: "bucket_name",
        optional: false,
      },
      {
        type: "text",
        query: "Gib das Präfix ein:",
        label: "Präfix",
        name: "prefix",
        optional: true,
      },
      {
        type: "text",
        label: "Bucket-Typ",
        name: "bucket_type",
        optional: false,
        default: "s3",
        hidden: true,
      },
    ],
    advanced_values: [],
    overrideDefaultFreq: 60 * 60 * 24,
  },
  r2: {
    description: "Konfiguriere R2-Connector",
    values: [
      {
        type: "text",
        query: "Gib den Bucket-Namen ein:",
        label: "Bucket-Name",
        name: "bucket_name",
        optional: false,
      },
      {
        type: "text",
        query: "Gib das Präfix ein:",
        label: "Präfix",
        name: "prefix",
        optional: true,
      },
      {
        type: "text",
        label: "Bucket-Typ",
        name: "bucket_type",
        optional: false,
        default: "r2",
        hidden: true,
      },
    ],
    advanced_values: [],
    overrideDefaultFreq: 60 * 60 * 24,
  },
  google_cloud_storage: {
    description: "Konfiguriere Google Cloud Storage-Connector",
    values: [
      {
        type: "text",
        query: "Gib den Bucket-Namen ein:",
        label: "Bucket-Name",
        name: "bucket_name",
        optional: false,
        description: "Name des zu indexierenden GCS-Buckets, z.B. my-gcs-bucket",
      },
      {
        type: "text",
        query: "Gib das Präfix ein:",
        label: "Pfad-Präfix",
        name: "prefix",
        optional: true,
      },
      {
        type: "text",
        label: "Bucket-Typ",
        name: "bucket_type",
        optional: false,
        default: "google_cloud_storage",
        hidden: true,
      },
    ],
    advanced_values: [],
    overrideDefaultFreq: 60 * 60 * 24,
  },
  oci_storage: {
    description: "Konfiguriere OCI Storage-Connector",
    values: [
      {
        type: "text",
        query: "Gib den Bucket-Namen ein:",
        label: "Bucket-Name",
        name: "bucket_name",
        optional: false,
      },
      {
        type: "text",
        query: "Gib das Präfix ein:",
        label: "Präfix",
        name: "prefix",
        optional: true,
      },
      {
        type: "text",
        label: "Bucket-Typ",
        name: "bucket_type",
        optional: false,
        default: "oci_storage",
        hidden: true,
      },
    ],
    advanced_values: [],
  },
  wikipedia: {
    description: "Konfiguriere Wikipedia-Connector",
    values: [
      {
        type: "text",
        query: "Gib den Sprachcode ein:",
        label: "Sprachcode",
        name: "language_code",
        optional: false,
        description: "Gib einen gültigen Wikipedia-Sprachcode ein (z.B. 'en', 'es')",
      },
      {
        type: "list",
        query: "Gib Kategorien an, die einbezogen werden sollen:",
        label: "Zu indexierende Kategorien",
        name: "categories",
        description:
          "Gib null oder mehr Namen von Kategorien an, die indexiert werden sollen. Für die meisten Wikipedia-Seiten sind dies Seiten mit einem Namen der Form 'Kategorie: XYZ', die Listen anderer Seiten/Kategorien sind. Gib nur den Namen der Kategorie an, nicht deren URL.",
        optional: true,
      },
      {
        type: "list",
        query: "Gib Seiten an, die einbezogen werden sollen:",
        label: "Seiten",
        name: "pages",
        optional: true,
        description: "Gib null oder mehr Namen von Seiten an, die indexiert werden sollen.",
      },
      {
        type: "number",
        query: "Gib die Rekursionstiefe ein:",
        label: "Rekursionstiefe",
        name: "recurse_depth",
        description:
          "Beim Indexieren von Kategorien, die Unterkategorien haben, wird dies bestimmen, wie viele Ebenen indexiert werden sollen. Gib 0 an, um nur die Kategorie selbst zu indexieren (d.h. ohne Rekursion). Gib -1 für unbegrenzte Rekursionstiefe an. Beachte, dass in einigen seltenen Fällen eine Kategorie sich selbst in ihren Abhängigkeiten enthalten könnte, was zu einer Endlosschleife führt. Verwende -1 nur, wenn du sicher bist, dass dies nicht passieren wird.",
        optional: false,
      },
    ],
    advanced_values: [],
  },
  xenforo: {
    description: "Konfiguriere Xenforo-Connector",
    values: [
      {
        type: "text",
        query: "Gib die Forum- oder Thread-URL ein:",
        label: "URL",
        name: "base_url",
        optional: false,
        description:
          "Die XenForo v2.2 Forum-URL, die indexiert werden soll. Kann ein Board oder ein Thread sein.",
      },
    ],
    advanced_values: [],
  },
  asana: {
    description: "Konfiguriere Asana-Connector",
    values: [
      {
        type: "text",
        query: "Gib die ID deines Asana-Workspaces ein:",
        label: "Workspace-ID",
        name: "asana_workspace_id",
        optional: false,
        description:
          "Die ID des Asana-Workspaces, der indexiert werden soll. Du findest diese unter: https://app.asana.com/api/1.0/workspaces. Es ist eine Zahl, die so aussieht: 1234567890123456.",
      },
      {
        type: "text",
        query: "Gib die IDs der zu indexierenden Projekte ein (optional):",
        label: "Projekt-IDs",
        name: "asana_project_ids",
        description:
          "IDs bestimmter Asana-Projekte, die indexiert werden sollen, durch Kommas getrennt. Leer lassen, um alle Projekte im Workspace zu indexieren. Beispiel: 1234567890123456,2345678901234567",
        optional: true,
      },
      {
        type: "text",
        query: "Gib die Team-ID ein (optional):",
        label: "Team-ID",
        name: "asana_team_id",
        optional: true,
        description:
          "ID eines Teams, das zum Zugriff auf team-sichtbare Aufgaben verwendet wird. Dadurch können zusätzlich zu öffentlichen Aufgaben auch team-sichtbare Aufgaben indexiert werden. Leer lassen, wenn du diese Funktion nicht nutzen möchtest.",
      },
    ],
    advanced_values: [],
  },
  mediawiki: {
    description: "Konfiguriere MediaWiki-Connector",
    values: [
      {
        type: "text",
        query: "Gib den Sprachcode ein:",
        label: "Sprachcode",
        name: "language_code",
        optional: false,
        description: "Gib einen gültigen MediaWiki-Sprachcode ein (z.B. 'en', 'es')",
      },
      {
        type: "text",
        query: "Gib die MediaWiki-Site-URL ein",
        label: "MediaWiki-Site-URL",
        name: "hostname",
        optional: false,
      },
      {
        type: "list",
        query: "Gib Kategorien an, die einbezogen werden sollen:",
        label: "Zu indexierende Kategorien",
        name: "categories",
        description:
          "Gib null oder mehr Namen von Kategorien an, die indexiert werden sollen. Für die meisten MediaWiki-Sites sind dies Seiten mit einem Namen der Form 'Kategorie: XYZ', die Listen anderer Seiten/Kategorien sind. Gib nur den Namen der Kategorie an, nicht deren URL.",
        optional: true,
      },
      {
        type: "list",
        query: "Gib Seiten an, die einbezogen werden sollen:",
        label: "Seiten",
        name: "pages",
        optional: true,
        description:
          "Gib null oder mehr Namen von Seiten an, die indexiert werden sollen. Gib nur den Namen der Seite an, nicht deren URL.",
      },
      {
        type: "number",
        query: "Gib die Rekursionstiefe ein:",
        label: "Rekursionstiefe",
        name: "recurse_depth",
        description:
          "Beim Indexieren von Kategorien, die Unterkategorien haben, wird dies bestimmen, wie viele Ebenen indexiert werden sollen. Gib 0 an, um nur die Kategorie selbst zu indexieren (d.h. ohne Rekursion). Gib -1 für unbegrenzte Rekursionstiefe an. Beachte, dass in einigen seltenen Fällen eine Kategorie sich selbst in ihren Abhängigkeiten enthalten könnte, was zu einer Endlosschleife führt. Verwende -1 nur, wenn du sicher bist, dass dies nicht passieren wird.",
        optional: true,
      },
    ],
    advanced_values: [],
  },
  freshdesk: {
    description: "Konfiguriere Freshdesk-Connector",
    values: [],
    advanced_values: [],
  },
  fireflies: {
    description: "Configure Fireflies connector",
    values: [],
    advanced_values: [],
  },
  egnyte: {
    description: "Configure Egnyte connector",
    values: [
      {
        type: "text",
        query: "Enter folder path to index:",
        label: "Folder Path",
        name: "folder_path",
        optional: true,
        description:
          "The folder path to index (e.g., '/Shared/Documents'). Leave empty to index everything.",
      },
    ],
    advanced_values: [],
  },
  label_manual: {
    description: "Label-Handbuch-Anbindung einrichten",
    values: [
      {
        type: "text",
        query:
          "Gib die Website-URL zum Einlesen ein, z.B. https://handbuch.mylabelwin.de/100/:",
        label: "Basis-URL",
        name: "base_url",
        description:
          "Die Handbuch-Version am Ende muss zwingend mit angegeben sein und sollte immer auf die neuste aktuell verfügbare Labelwin-Version gestellt werden. Mehrere Handbuch-Versionen parallel zu indizieren ergibt wahrscheinlich wenig Sinn.",
        optional: false,
      },
      {
        type: "select",
        query: "Wähle die Durchsuch-Methode aus:",
        label: "Durchsuch-Methode",
        name: "web_connector_type",
        optional: true,
        options: [
          { name: "recursive", value: "recursive" },
          { name: "single", value: "single" },
          { name: "sitemap", value: "sitemap" },
        ],
      },
    ],
    overrideDefaultFreq: 60 * 60 * 24,
    advanced_values: [],
  },
};
export function createConnectorInitialValues(
  connector: ConfigurableSources
): Record<string, any> & AccessTypeGroupSelectorFormType {
  const configuration = connectorConfigs[connector];

  return {
    name: "",
    groups: [],
    access_type: "public",
    ...configuration.values.reduce(
      (acc, field) => {
        if (field.type === "select") {
          acc[field.name] = null;
        } else if (field.type === "list") {
          acc[field.name] = field.default || [];
        } else if (field.type === "checkbox") {
          acc[field.name] = field.default || false;
        } else if (field.default !== undefined) {
          acc[field.name] = field.default;
        }
        return acc;
      },
      {} as { [record: string]: any }
    ),
  };
}

export function createConnectorValidationSchema(
  connector: ConfigurableSources
): Yup.ObjectSchema<Record<string, any>> {
  const configuration = connectorConfigs[connector];

  return Yup.object().shape({
    access_type: Yup.string().required("Zugriffsart ist erforderlich"),
    name: Yup.string().required("Connector-Name ist erforderlich"),
    ...configuration.values.reduce(
      (acc, field) => {
        let schema: any =
          field.type === "select"
            ? Yup.string()
            : field.type === "list"
              ? Yup.array().of(Yup.string())
              : field.type === "checkbox"
                ? Yup.boolean()
                : field.type === "file"
                  ? Yup.mixed()
                  : Yup.string();

        if (!field.optional) {
          schema = schema.required(`${field.label} ist erforderlich`);
        }

        acc[field.name] = schema;
        return acc;
      },
      {} as Record<string, any>
    ),
    // These are advanced settings
    indexingStart: Yup.string().nullable(),
    pruneFreq: Yup.number().min(0, "Prune-Häufigkeit muss nicht negativ sein"),
    refreshFreq: Yup.number().min(0, "Refresh-Häufigkeit muss nicht negativ sein"),
  });
}

export const defaultPruneFreqDays = 30; // 30 days
export const defaultRefreshFreqMinutes = 30; // 30 minutes

// CONNECTORS
export interface ConnectorBase<T> {
  name: string;
  source: ValidSources;
  input_type: ValidInputTypes;
  connector_specific_config: T;
  refresh_freq: number | null;
  prune_freq: number | null;
  indexing_start: Date | null;
  access_type: string;
  groups?: number[];
}

export interface Connector<T> extends ConnectorBase<T> {
  id: number;
  credential_ids: number[];
  time_created: string;
  time_updated: string;
}

export interface ConnectorSnapshot {
  id: number;
  name: string;
  source: ValidSources;
  input_type: ValidInputTypes;
  // connector_specific_config
  refresh_freq: number | null;
  prune_freq: number | null;
  credential_ids: number[];
  indexing_start: number | null;
  time_created: string;
  time_updated: string;
}

export interface WebConfig {
  base_url: string;
  web_connector_type?: "recursive" | "single" | "sitemap";
}

export interface GithubConfig {
  repo_owner: string;
  repo_name: string;
  include_prs: boolean;
  include_issues: boolean;
}

export interface GitlabConfig {
  project_owner: string;
  project_name: string;
  include_mrs: boolean;
  include_issues: boolean;
}

export interface GoogleDriveConfig {
  include_shared_drives?: boolean;
  shared_drive_urls?: string;
  include_my_drives?: boolean;
  my_drive_emails?: string;
  shared_folder_urls?: string;
}

export interface GmailConfig {}

export interface BookstackConfig {}

export interface ConfluenceConfig {
  wiki_base: string;
  space?: string;
  page_id?: string;
  is_cloud?: boolean;
  index_recursively?: boolean;
  cql_query?: string;
}

export interface JiraConfig {
  jira_project_url: string;
  comment_email_blacklist?: string[];
}

export interface SalesforceConfig {
  requested_objects?: string[];
}

export interface SharepointConfig {
  sites?: string[];
}

export interface TeamsConfig {
  teams?: string[];
}

export interface DiscourseConfig {
  base_url: string;
  categories?: string[];
}

export interface AxeroConfig {
  spaces?: string[];
}

export interface TeamsConfig {
  teams?: string[];
}

export interface ProductboardConfig {}

export interface SlackConfig {
  workspace: string;
  channels?: string[];
  channel_regex_enabled?: boolean;
}

export interface SlabConfig {
  base_url: string;
}

export interface GuruConfig {}

export interface GongConfig {
  workspaces?: string[];
}

export interface LoopioConfig {
  loopio_stack_name?: string;
}

export interface FileConfig {
  file_locations: string[];
}

export interface ZulipConfig {
  realm_name: string;
  realm_url: string;
}

export interface NotionConfig {
  root_page_id?: string;
}

export interface HubSpotConfig {}

export interface Document360Config {
  workspace: string;
  categories?: string[];
}

export interface ClickupConfig {
  connector_type: "list" | "folder" | "space" | "workspace";
  connector_ids?: string[];
  retrieve_task_comments: boolean;
}

export interface GoogleSitesConfig {
  zip_path: string;
  base_url: string;
}

export interface XenforoConfig {
  base_url: string;
}

export interface ZendeskConfig {}

export interface DropboxConfig {}

export interface S3Config {
  bucket_type: "s3";
  bucket_name: string;
  prefix: string;
}

export interface R2Config {
  bucket_type: "r2";
  bucket_name: string;
  prefix: string;
}

export interface GCSConfig {
  bucket_type: "google_cloud_storage";
  bucket_name: string;
  prefix: string;
}

export interface OCIConfig {
  bucket_type: "oci_storage";
  bucket_name: string;
  prefix: string;
}

export interface MediaWikiBaseConfig {
  connector_name: string;
  language_code: string;
  categories?: string[];
  pages?: string[];
  recurse_depth?: number;
}

export interface AsanaConfig {
  asana_workspace_id: string;
  asana_project_ids?: string;
  asana_team_id?: string;
}

export interface FreshdeskConfig {}

export interface FirefliesConfig {}

export interface MediaWikiConfig extends MediaWikiBaseConfig {
  hostname: string;
}

export interface WikipediaConfig extends MediaWikiBaseConfig {}

export interface LabelManualConfig {
  base_url: string;
  web_connector_type?: "recursive" | "single" | "sitemap";
}