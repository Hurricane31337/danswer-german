"use effect";
import { useContext } from "react";
import { FiSidebar } from "react-icons/fi";
import { SettingsContext } from "../settings/SettingsProvider";
import {
  NEXT_PUBLIC_DO_NOT_USE_TOGGLE_OFF_DANSWER_POWERED,
  NEXT_PUBLIC_NEW_CHAT_DIRECTS_TO_SAME_PERSONA,
} from "@/lib/constants";
import { LeftToLineIcon, NewChatIcon, RightToLineIcon } from "../icons/icons";
import { Tooltip } from "../tooltip/Tooltip";
import { pageType } from "@/app/chat/sessionSidebar/types";
import { Logo } from "../Logo";
import { HeaderTitle } from "./HeaderTitle";
import Link from "next/link";

export default function LogoType({
  toggleSidebar,
  hideOnMobile,
  handleNewChat,
  page,
  toggled,
  showArrow,
  assistantId,
  explicitlyUntoggle = () => null,
}: {
  hideOnMobile?: boolean;
  toggleSidebar?: () => void;
  handleNewChat?: () => void;
  page: pageType;
  toggled?: boolean;
  showArrow?: boolean;
  assistantId?: number;
  explicitlyUntoggle?: () => void;
}) {
  const combinedSettings = useContext(SettingsContext);
  const enterpriseSettings = combinedSettings?.enterpriseSettings;

  return (
    <div
      className={`${hideOnMobile && "mobile:hidden"} z-[100] mb-auto shrink-0 flex items-center text-xl font-bold`}
    >
      {toggleSidebar && page == "chat" ? (
        <button
          onClick={() => toggleSidebar()}
          className="pt-[2px] ml-4 desktop:invisible mb-auto"
        >
          <FiSidebar size={20} />
        </button>
      ) : (
        <div className="mr-1 invisible mb-auto h-6 w-6">
          <Logo height={24} width={24} />
        </div>
      )}
      <div
        className={`cursor-pointer ${showArrow ? "desktop:invisible" : "invisible"} break-words inline-block w-fit ml-2 text-text-700 text-xl`}
      >
        <div className="max-w-[175px]">
          {enterpriseSettings && enterpriseSettings.application_name ? (
            <div>
              <HeaderTitle>{enterpriseSettings.application_name}</HeaderTitle>
              {!NEXT_PUBLIC_DO_NOT_USE_TOGGLE_OFF_DANSWER_POWERED && (
                <p className="text-xs text-subtle">Powered by Danswer</p>
              )}
            </div>
          ) : (
            <HeaderTitle>Danswer</HeaderTitle>
          )}
        </div>
      </div>

      {page == "chat" && !showArrow && (
        <Tooltip delayDuration={1000} content="New Chat">
          <Link
            className="my-auto mobile:hidden"
            href={
              `/${page}` +
              (NEXT_PUBLIC_NEW_CHAT_DIRECTS_TO_SAME_PERSONA && assistantId
                ? `?assistantId=${assistantId}`
                : "")
            }
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey) {
                return;
              }
              if (handleNewChat) {
                handleNewChat();
              }
            }}
          >
            <div className="cursor-pointer ml-2 flex-none text-text-700 hover:text-text-600 transition-colors duration-300">
              <NewChatIcon size={20} />
            </div>
          </Link>
        </Tooltip>
      )}
      {showArrow && toggleSidebar && (
        <Tooltip
          delayDuration={0}
          content={toggled ? `Unpin sidebar` : "Pin sidebar"}
        >
          <button
            className="mr-3 my-auto ml-auto"
            onClick={() => {
              toggleSidebar();
              if (toggled) {
                explicitlyUntoggle();
              }
            }}
          >
            {!toggled && !combinedSettings?.isMobile ? (
              <RightToLineIcon />
            ) : (
              <LeftToLineIcon />
            )}
          </button>
        </Tooltip>
      )}
    </div>
  );
}
