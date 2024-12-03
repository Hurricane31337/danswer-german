"use client";

import {
  Persona,
  PersonaCategory as PersonaCategoryType,
} from "@/app/admin/assistants/interfaces";
import { AssistantIcon } from "@/components/assistants/AssistantIcon";
import { User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { FiList, FiMinus, FiPlus } from "react-icons/fi";
import { AssistantsPageTitle } from "../AssistantsPageTitle";
import {
  addAssistantToList,
  removeAssistantFromList,
} from "@/lib/assistants/updateAssistantPreferences";
import { PopupSpec, usePopup } from "@/components/admin/connectors/Popup";
import { useRouter } from "next/navigation";
import { AssistantTools } from "../ToolsDisplay";
import { classifyAssistants } from "@/lib/assistants/utils";
import { useAssistants } from "@/components/context/AssistantsContext";
import { useUser } from "@/components/user/UserProvider";
import PersonaCategory from "../PersonaCategory";
import { useCategories } from "@/lib/hooks";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AssistantGalleryCard({
  onlyAssistant,
  assistant,
  user,
  setPopup,
  selectedAssistant,
}: {
  onlyAssistant: boolean;
  assistant: Persona;
  user: User | null;
  setPopup: (popup: PopupSpec) => void;
  selectedAssistant: boolean;
}) {
  const { data: categories } = useCategories();
  const { refreshUser } = useUser();

  return (
    <div
      key={assistant.id}
      className="
				bg-background-emphasis
				rounded-lg
				shadow-md
				p-4
			"
    >
      <div className="flex items-center">
        <AssistantIcon assistant={assistant} />
        <h2
          className="
						text-xl
						font-semibold
						my-auto
						ml-2
						text-strong
						line-clamp-2
					"
        >
          {assistant.name}
        </h2>
        {user && (
          <div className="ml-auto">
            {selectedAssistant ? (
              <Button
                className="
									mr-2
									my-auto
									bg-background-700
									hover:bg-background-600
								"
                icon={FiMinus}
                onClick={async () => {
                  if (onlyAssistant) {
                    setPopup({
                      message: `Kann "${assistant.name}" nicht entfernen – du musst mindestens einen Assistenten haben.`,
                      type: "error",
                    });
                    return;
                  }

                  const success = await removeAssistantFromList(assistant.id);
                  if (success) {
                    setPopup({
                      message: `"${assistant.name}" wurde aus deiner Liste entfernt.`,
                      type: "success",
                    });
                    await refreshUser();
                  } else {
                    setPopup({
                      message: `"${assistant.name}" konnte nicht aus deiner Liste entfernt werden.`,
                      type: "error",
                    });
                  }
                }}
                size="sm"
                variant="destructive"
              >
                Abwählen
              </Button>
            ) : (
              <Button
                className="
									mr-2
									my-auto
									bg-accent
									hover:bg-accent-hover
								"
                icon={FiPlus}
                onClick={async () => {
                  const success = await addAssistantToList(assistant.id);
                  if (success) {
                    setPopup({
                      message: `"${assistant.name}" wurde zu deiner Liste hinzugefügt.`,
                      type: "success",
                    });
                    await refreshUser();
                  } else {
                    setPopup({
                      message: `"${assistant.name}" konnte nicht zu deiner Liste hinzugefügt werden.`,
                      type: "error",
                    });
                  }
                }}
                size="sm"
                variant="submit"
              >
                Hinzufügen
              </Button>
            )}
          </div>
        )}
      </div>
      <p className="text-sm mt-2">{assistant.description}</p>
      <p className="text-subtle text-sm my-2">
        Autor: {assistant.owner?.email || "Label KI"}
      </p>
      {assistant.tools.length > 0 && (
        <AssistantTools list assistant={assistant} />
      )}
      {assistant.category_id && categories && (
        <PersonaCategory
          personaCategory={
            categories?.find(
              (category: PersonaCategoryType) =>
                category.id === assistant.category_id
            )!
          }
        />
      )}
    </div>
  );
}
export function AssistantsGallery() {
  const { assistants } = useAssistants();
  const { user } = useUser();

  const { data: categories } = useCategories();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const { popup, setPopup } = usePopup();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const { visibleAssistants, hiddenAssistants: _ } = classifyAssistants(
    user,
    assistants
  );

  const defaultAssistants = assistants
    .filter((assistant) => assistant.is_default_persona)
    .filter(
      (assistant) =>
        (assistant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          assistant.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) &&
        (selectedCategory === null ||
          selectedCategory === assistant.category_id)
    );

  const nonDefaultAssistants = assistants
    .filter((assistant) => !assistant.is_default_persona)
    .filter(
      (assistant) =>
        (assistant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          assistant.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) &&
        (selectedCategory === null ||
          selectedCategory === assistant.category_id)
    );

  return (
    <>
      {popup}
      <div className="mx-auto w-searchbar-xs 2xl:w-searchbar-sm 3xl:w-searchbar">
        <AssistantsPageTitle>Assistenten-Galerie</AssistantsPageTitle>

        <div className="grid grid-cols-2 gap-4 mt-4 mb-6">
          <Button
            onClick={() => router.push("/assistants/new")}
            variant="default"
            className="p-6 text-base"
            icon={FiPlus}
          >
            Neuen Assistenten erstellen
          </Button>

          <Button
            onClick={() => router.push("/assistants/mine")}
            variant="outline"
            className="text-base py-6"
            icon={FiList}
          >
            Deine Assistenten
          </Button>
        </div>

        <div className="mt-4 mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Assistenten suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="
                w-full
                py-3
                px-4
                pl-10
                text-lg
                border-2
                border-background-strong
                rounded-full
                bg-background-50
                text-text-700
                placeholder-text-400
                focus:outline-none
                focus:ring-2
                focus:ring-primary-500
                focus:border-transparent
                transition duration-300 ease-in-out
              "
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-text-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        {categories && categories?.length > 0 && (
          <div className="mb-8">
            <Select
              value={selectedCategory?.toString() || "all"}
              onValueChange={(value) =>
                setSelectedCategory(value === "all" ? null : parseInt(value))
              }
            >
              <SelectTrigger
                className="
                w-[240px]
                bg-background 
                border-2
                border-background-strong
                text-text-500
                rounded-lg
                shadow-sm
                hover:bg-background-emphasis
                hover:border-primary-500/50
                hover:text-primary-500
                transition-all
                duration-200
              "
              >
                <SelectValue placeholder="Filter by category..." />
              </SelectTrigger>
              <SelectContent className="bg-background border-background-strong">
                <SelectGroup>
                  <SelectLabel className="text-sm font-medium text-text-400">
                    Categories
                  </SelectLabel>
                  <SelectItem
                    value="all"
                    className="cursor-pointer hover:bg-background-emphasis"
                  >
                    All Categories
                  </SelectItem>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                      className="cursor-pointer hover:bg-background-emphasis"
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}

        {defaultAssistants.length == 0 &&
          nonDefaultAssistants.length == 0 &&
          assistants.length != 0 && (
            <div className="text-text-500">
              Keine Assistenten für diese Suche gefunden
            </div>
          )}

        {defaultAssistants.length > 0 && (
          <>
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-2 text-text-900">
                Standard-Assistenten
              </h2>

              <h3 className="text-lg text-text-500">
                Diese Assistenten wurden von deinen Admins erstellt und werden bevorzugt.
              </h3>
            </section>
            <div
              className="
                  w-full
                  grid
                  grid-cols-2
                  gap-4
                  py-2
                "
            >
              {defaultAssistants.map((assistant) => (
                <AssistantGalleryCard
                  onlyAssistant={visibleAssistants.length === 1}
                  selectedAssistant={visibleAssistants.includes(assistant)}
                  key={assistant.id}
                  assistant={assistant}
                  user={user}
                  setPopup={setPopup}
                />
              ))}
            </div>
          </>
        )}

        {nonDefaultAssistants.length > 0 && (
          <section className="mt-12 mb-8 flex flex-col gap-y-2">
            <div className="flex flex-col">
              <h2 className="text-2xl font-semibold text-text-900">
                Andere Assistenten
              </h2>
              <h3 className="text-lg text-text-500">
                Diese Assistenten wurden von der Community beigesteuert.
              </h3>
            </div>

            <div
              className="
                  w-full
                  grid
                  grid-cols-2
                  gap-4
                  py-2
                "
            >
              {nonDefaultAssistants.map((assistant) => (
                <AssistantGalleryCard
                  onlyAssistant={visibleAssistants.length === 1}
                  selectedAssistant={visibleAssistants.includes(assistant)}
                  key={assistant.id}
                  assistant={assistant}
                  user={user}
                  setPopup={setPopup}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
