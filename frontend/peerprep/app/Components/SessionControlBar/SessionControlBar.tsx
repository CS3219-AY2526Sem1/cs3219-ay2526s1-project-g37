import { Text } from "@mantine/core";
import { useCollabProvider } from "~/Context/CollabProvider";
import EndSessionModal from "../CollabModals/EndSessionModal";

/**
 * Session Control Bar component
 * @param props - Props containing user and optional onEndSession callback
 * @returns JSX.Element
 */
export default function SessionControlBar(props: {user: string | null, onEndSession?: () => void}) {
  const { user, onEndSession } = props;
  const collabProvider = useCollabProvider();

  /**
   * Handle ending the session
   */
  const handleEndSession = () => {
    if (collabProvider) {
      collabProvider.clearWebsocketSession();
    }
    if (onEndSession) {
      onEndSession();
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px", justifyContent: "center" }}>
      <Text fw={700}>
        Connected With:{" "}
        <span style={{ color: "var(--mantine-color-green-5)" }}>{user}</span>
      </Text>
      <EndSessionModal onEndSession={handleEndSession} />
    </div>
  );
}
