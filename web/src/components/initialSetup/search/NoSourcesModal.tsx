"use client";

import { Button, Divider, Text } from "@tremor/react";
import { Modal } from "../../Modal";
import Link from "next/link";
import { FiMessageSquare, FiShare2 } from "react-icons/fi";
import { useContext, useState } from "react";
import { SettingsContext } from "@/components/settings/SettingsProvider";

export function NoSourcesModal() {
  const settings = useContext(SettingsContext);
  const [isHidden, setIsHidden] = useState(
    !settings?.settings.search_page_enabled ?? false
  );

  if (isHidden) {
    return null;
  }

  return (
    <Modal
      className="max-w-4xl"
      title="🧐 Keine Quellen verbunden"
      onOutsideClick={() => setIsHidden(true)}
    >
      <div className="text-base">
        <div>
          <Text>
            Bevor du die Suche verwenden kannst, musst du mindestens eine Quelle
            verbinden. Ohne verbundene Wissensquellen gibt es nichts, was du
            durchsuchen könntest.
          </Text>
          <Link href="/admin/add-connector">
            <Button className="mt-3" size="xs" icon={FiShare2}>
              Verbinde eine Quelle!
            </Button>
          </Link>
          <Divider />
          <div>
            <Text>
              Oder, wenn du nach einer reinen ChatGPT-ähnlichen Oberfläche ohne
              organisationsspezifischem Wissen suchst, dann kannst du zur
              Chat-Seite gehen und sofort mit Danswer chatten!
            </Text>
            <Link href="/chat">
              <Button className="mt-3" size="xs" icon={FiMessageSquare}>
                Beginne zu chatten!
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Modal>
  );
}
