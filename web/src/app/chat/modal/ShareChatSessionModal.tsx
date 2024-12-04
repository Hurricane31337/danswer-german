import { useState } from "react";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";

import Text from "@/components/ui/text";

import { ChatSessionSharedStatus } from "../interfaces";
import { FiCopy } from "react-icons/fi";
import { CopyButton } from "@/components/CopyButton";
import { SEARCH_PARAM_NAMES } from "../searchParams";
import { usePopup } from "@/components/admin/connectors/Popup";
import { structureValue } from "@/lib/llm/utils";
import { LlmOverride } from "@/lib/hooks";
import { Separator } from "@/components/ui/separator";

function buildShareLink(chatSessionId: string) {
  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  return `${baseUrl}/chat/shared/${chatSessionId}`;
}

async function generateShareLink(chatSessionId: string) {
  const response = await fetch(`/api/chat/chat-session/${chatSessionId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sharing_status: "public" }),
  });

  if (response.ok) {
    return buildShareLink(chatSessionId);
  }
  return null;
}

async function generateCloneLink(
  message?: string,
  assistantId?: number,
  modelOverride?: LlmOverride
) {
  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const model = modelOverride
    ? structureValue(
        modelOverride.name,
        modelOverride.provider,
        modelOverride.modelName
      )
    : null;
  return `${baseUrl}/chat${
    message
      ? `?${SEARCH_PARAM_NAMES.USER_PROMPT}=${encodeURIComponent(message)}`
      : ""
  }${
    assistantId
      ? `${message ? "&" : "?"}${SEARCH_PARAM_NAMES.PERSONA_ID}=${assistantId}`
      : ""
  }${
    model
      ? `${message || assistantId ? "&" : "?"}${
          SEARCH_PARAM_NAMES.STRUCTURED_MODEL
        }=${encodeURIComponent(model)}`
      : ""
  }${message ? `&${SEARCH_PARAM_NAMES.SEND_ON_LOAD}=true` : ""}`;
}

async function deleteShareLink(chatSessionId: string) {
  const response = await fetch(`/api/chat/chat-session/${chatSessionId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sharing_status: "private" }),
  });

  return response.ok;
}

export function ShareChatSessionModal({
  chatSessionId,
  existingSharedStatus,
  onShare,
  onClose,
  message,
  assistantId,
  modelOverride,
}: {
  chatSessionId: string;
  existingSharedStatus: ChatSessionSharedStatus;
  onShare?: (shared: boolean) => void;
  onClose: () => void;
  message?: string;
  assistantId?: number;
  modelOverride?: LlmOverride;
}) {
  const [shareLink, setShareLink] = useState<string>(
    existingSharedStatus === ChatSessionSharedStatus.Public
      ? buildShareLink(chatSessionId)
      : ""
  );
  const { popup, setPopup } = usePopup();

  return (
    <>
      {popup}
      <Modal onOutsideClick={onClose} width="max-w-3xl">
        <>
          <div className="flex mb-4">
            <h2 className="text-2xl text-emphasis font-bold flex my-auto">
              Link zum Chat teilen
            </h2>
          </div>

          <div className="flex mt-2">
            {shareLink ? (
              <div>
                <Text>
                  Diese Chat-Sitzung wird derzeit geteilt. Jeder in deiner
                  Organisation kann den Nachrichtenverlauf mit dem folgenden
                  Link ansehen:
                </Text>

                <div className="flex mt-2">
                  <CopyButton content={shareLink} />
                  <a
                    href={shareLink}
                    target="_blank"
                    className="underline text-link mt-1 ml-1 text-sm my-auto"
                    rel="noreferrer"
                  >
                    {shareLink}
                  </a>
                </div>

                <Separator />

                <Text className="mb-4">
                  Klicke den Button unten, um den Chat wieder privat zu machen.
                </Text>

                <Button
                  onClick={async () => {
                    const success = await deleteShareLink(chatSessionId);
                    if (success) {
                      setShareLink("");
                      onShare && onShare(false);
                    } else {
                      alert("Löschen des Teilungslinks fehlgeschlagen");
                    }
                  }}
                  size="sm"
                  variant="destructive"
                >
                  Teilungslink löschen
                </Button>
              </div>
            ) : (
              <div>
                <Callout type="warning" title="Warnung" className="mb-4">
                  Stelle sicher, dass alle Inhalte im Chat sicher mit der
                  gesamten Organisation geteilt werden können. Der Inhalt
                  der abgerufenen Dokumente wird nicht sichtbar sein, aber
                  die Namen der zitierten Dokumente sowie die AI- und
                  menschlichen Nachrichten werden sichtbar sein.
                </Callout>
                <div className="flex w-full justify-between">
                  <Button
                    icon={FiCopy}
                    onClick={async () => {
                      // NOTE: for "insecure" non-https setup, the `navigator.clipboard.writeText` may fail
                      // as the browser may not allow the clipboard to be accessed.
                      try {
                        const shareLink =
                          await generateShareLink(chatSessionId);
                        if (!shareLink) {
                          alert("Erstellen des Teilungslinks fehlgeschlagen");
                        } else {
                          setShareLink(shareLink);
                          onShare && onShare(true);
                          navigator.clipboard.writeText(shareLink);
                        }
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                    size="sm"
                    variant="submit"
                  >
                    Teilungslink generieren und kopieren
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Separator className="my-4" />
          <div className="mb-4">
            <Callout type="notice" title="Chat klonen">
              Erstelle einen Link, um diese Chat-Sitzung mit der aktuellen Anfrage
              zu klonen. Dadurch können andere einen neuen Chat mit derselben
              Anfangsnachricht und denselben Einstellungen starten.
            </Callout>
          </div>
          <div className="flex w-full justify-between">
            <Button
              icon={FiCopy}
              onClick={async () => {
                // NOTE: for "insecure" non-https setup, the `navigator.clipboard.writeText` may fail
                // as the browser may not allow the clipboard to be accessed.
                try {
                  const cloneLink = await generateCloneLink(
                    message,
                    assistantId,
                    modelOverride
                  );
                  if (!cloneLink) {
                    setPopup({
                      message: "Erstellen des Klon-Links fehlgeschlagen",
                      type: "error",
                    });
                  } else {
                    navigator.clipboard.writeText(cloneLink);
                    setPopup({
                      message: "Link in die Zwischenablage kopiert!",
                      type: "success",
                    });
                  }
                } catch (e) {
                  console.error(e);
                  alert("Fehler beim Erstellen oder Kopieren des Links.");
                }
              }}
              size="sm"
              variant="secondary"
            >
              Klon-Link generieren und kopieren
            </Button>
          </div>
        </>
      </Modal>
    </>
  );
}
