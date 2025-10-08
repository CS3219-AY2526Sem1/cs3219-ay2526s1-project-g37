import { Text, Button } from "@mantine/core";
import { useCollabProvider } from "context/CollabProvider";

export default function SessionControlBar(props: {user: string | null, onEndSession?: () => void}) {
  const { user, onEndSession } = props;
  const collabProvider = useCollabProvider();

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
      <Button
        color="var(--mantine-color-red-5)"
        c="white"
        size="compact-md"
        autoContrast
        onClick={handleEndSession}
        aria-label="End session"
      >
        End Session
      </Button>
    </div>
  );
}
