"use client";

import { Text } from "@tremor/react";
import { Persona } from "./interfaces";
import { useRouter } from "next/navigation";
import { CustomCheckbox } from "@/components/CustomCheckbox";
import { usePopup } from "@/components/admin/connectors/Popup";
import { useState, useMemo, useEffect } from "react";
import { UniqueIdentifier } from "@dnd-kit/core";
import { DraggableTable } from "@/components/table/DraggableTable";
import {
  deletePersona,
  personaComparator,
  togglePersonaVisibility,
} from "./lib";
import { FiEdit2 } from "react-icons/fi";
import { TrashIcon } from "@/components/icons/icons";
import { getCurrentUser } from "@/lib/user";
import { UserRole, User } from "@/lib/types";
import { useUser } from "@/components/user/UserProvider";

function PersonaTypeDisplay({ persona }: { persona: Persona }) {
  if (persona.default_persona) {
    return <Text>Eingebaut</Text>;
  }

  if (persona.is_public) {
    return <Text>Global</Text>;
  }

  if (persona.groups.length > 0 || persona.users.length > 0) {
    return <Text>Geteilt</Text>;
  }

  return <Text>Persönlich {persona.owner && <>({persona.owner.email})</>}</Text>;
}

export function PersonasTable({
  allPersonas,
  editablePersonas,
}: {
  allPersonas: Persona[];
  editablePersonas: Persona[];
}) {
  const router = useRouter();
  const { popup, setPopup } = usePopup();

  const { isLoadingUser, isAdmin } = useUser();

  const editablePersonaIds = new Set(
    editablePersonas.map((p) => p.id.toString())
  );

  const sortedPersonas = useMemo(() => {
    const editable = editablePersonas.sort(personaComparator);
    const nonEditable = allPersonas
      .filter((p) => !editablePersonaIds.has(p.id.toString()))
      .sort(personaComparator);
    return [...editable, ...nonEditable];
  }, [allPersonas, editablePersonas]);

  const [finalPersonas, setFinalPersonas] = useState<string[]>(
    sortedPersonas.map((persona) => persona.id.toString())
  );
  const finalPersonaValues = finalPersonas
    .filter((id) => new Set(allPersonas.map((p) => p.id.toString())).has(id))
    .map((id) => {
      return sortedPersonas.find(
        (persona) => persona.id.toString() === id
      ) as Persona;
    });

  const updatePersonaOrder = async (orderedPersonaIds: UniqueIdentifier[]) => {
    setFinalPersonas(orderedPersonaIds.map((id) => id.toString()));

    const displayPriorityMap = new Map<UniqueIdentifier, number>();
    orderedPersonaIds.forEach((personaId, ind) => {
      displayPriorityMap.set(personaId, ind);
    });

    const response = await fetch("/api/admin/persona/display-priority", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        display_priority_map: Object.fromEntries(displayPriorityMap),
      }),
    });
    if (!response.ok) {
      setPopup({
        type: "error",
        message: `Aktualisierung der Persona-Reihenfolge fehlgeschlagen - ${await response.text()}`,
      });
      router.refresh();
    }
  };

  if (isLoadingUser) {
    return <></>;
  }

  return (
    <div>
      {popup}

      <Text className="my-2">
        Assistenten werden als Optionen in den Chat-/Such-Oberflächen in der
        Reihenfolge angezeigt, in der sie unten angezeigt werden. Als unsichtbar
        markierte Assistenten werden nicht angezeigt. Bearbeitbare Assistenten
        werden oben angezeigt.
      </Text>

      <DraggableTable
        headers={["Name", "Beschreibung", "Typ", "Ist sichtbar", "Löschen"]}
        isAdmin={isAdmin}
        rows={finalPersonaValues.map((persona) => {
          const isEditable = editablePersonaIds.has(persona.id.toString());
          return {
            id: persona.id.toString(),
            cells: [
              <div key="name" className="flex">
                {!persona.default_persona && (
                  <FiEdit2
                    className="mr-1 my-auto cursor-pointer"
                    onClick={() =>
                      router.push(
                        `/admin/assistants/${persona.id}?u=${Date.now()}`
                      )
                    }
                  />
                )}
                <p className="text font-medium whitespace-normal break-none">
                  {persona.name}
                </p>
              </div>,
              <p
                key="description"
                className="whitespace-normal break-all max-w-2xl"
              >
                {persona.description}
              </p>,
              <PersonaTypeDisplay key={persona.id} persona={persona} />,
              <div
                key="is_visible"
                onClick={async () => {
                  if (isEditable) {
                    const response = await togglePersonaVisibility(
                      persona.id,
                      persona.is_visible
                    );
                    if (response.ok) {
                      router.refresh();
                    } else {
                      setPopup({
                        type: "error",
                        message: `Persona konnte nicht aktualisiert werden - ${await response.text()}`,
                      });
                    }
                  }
                }}
                className={`px-1 py-0.5 rounded flex ${isEditable ? "hover:bg-hover cursor-pointer" : ""} select-none w-fit`}
              >
                <div className="my-auto w-12">
                  {!persona.is_visible ? (
                    <div className="text-error">Unsichtbar</div>
                  ) : (
                    "Sichtbar"
                  )}
                </div>
                <div className="ml-1 my-auto">
                  <CustomCheckbox checked={persona.is_visible} />
                </div>
              </div>,
              <div key="edit" className="flex">
                <div className="mx-auto my-auto">
                  {!persona.default_persona && isEditable ? (
                    <div
                      className="hover:bg-hover rounded p-1 cursor-pointer"
                      onClick={async () => {
                        const response = await deletePersona(persona.id);
                        if (response.ok) {
                          router.refresh();
                        } else {
                          alert(
                            `Persona konnte nicht gelöscht werden - ${await response.text()}`
                          );
                        }
                      }}
                    >
                      <TrashIcon />
                    </div>
                  ) : (
                    "-"
                  )}
                </div>
              </div>,
            ],
            staticModifiers: [[1, "lg:w-[250px] xl:w-[400px] 2xl:w-[550px]"]],
          };
        })}
        setRows={updatePersonaOrder}
      />
    </div>
  );
}
