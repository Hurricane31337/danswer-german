import { useProviderStatus } from "./ProviderContext";

export default function CredentialNotConfigured({
  showConfigureAPIKey,
  noSources,
}: {
  showConfigureAPIKey: () => void;
  noSources?: boolean;
}) {
  const { shouldShowConfigurationNeeded } = useProviderStatus();

  return (
    <>
      {noSources ? (
        <p className="text-base text-center w-full text-subtle">
          Du hast noch keine Quellen hinzugefügt. Bitte füge{" "}
          <a
            href="/admin/add-connector"
            className="text-link hover:underline cursor-pointer"
          >
            eine Quelle
          </a>{" "}
          hinzu, um fortzufahren.
        </p>
      ) : (
        shouldShowConfigurationNeeded && (
          <p className="text-base text-center w-full text-subtle">
            Bitte beachte, dass du noch keinen LLM-Anbieter konfiguriert hast.
            Du kannst einen{" "}
            <button
              onClick={showConfigureAPIKey}
              className="text-link hover:underline cursor-pointer"
            >
              hier
            </button>{" "}
            konfigurieren.
          </p>
        )
      )}
    </>
  );
}
