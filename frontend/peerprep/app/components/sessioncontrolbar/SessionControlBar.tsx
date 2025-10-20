import { Text, Button } from "@mantine/core";
import { useCollabProvider } from "~/context/CollabProvider";
import { modals } from "@mantine/modals";

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

  const openConfirmModal = () => {
    modals.openConfirmModal({
      title: "End Session",
      children: (
        <Text size="sm">
          Are you sure you want to end this session? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: "End Session", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: handleEndSession,
    });
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
        onClick={openConfirmModal}
        aria-label="End session"
      >
        End Session
      </Button>
    </div>
  );
}
