import { useProviderStatus } from "./ProviderContext";

export default function CredentialNotConfigured({
  showConfigureAPIKey,
}: {
  showConfigureAPIKey: () => void;
}) {
  const { shouldShowConfigurationNeeded } = useProviderStatus();

  if (!shouldShowConfigurationNeeded) {
    return null;
  }

  return (
    <p className="text-base text-center w-full text-subtle">
      Bitte beachte, dass du noch keinen LLM-Anbieter konfiguriert hast. Du
      kannst{" "}
      <button
        onClick={showConfigureAPIKey}
        className="text-link hover:underline cursor-pointer"
      >
        hier
      </button>
      {" "}einen einrichten.
    </p>
  );
}
