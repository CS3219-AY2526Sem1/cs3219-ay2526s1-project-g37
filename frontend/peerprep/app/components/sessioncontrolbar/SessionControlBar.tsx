import { Text, Button } from "@mantine/core";

export default function SessionControlBar(props: {user: string | null, onEndSession?: () => void}) {
  const { user, onEndSession } = props;

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
        onClick={onEndSession}
        aria-label="End session"
      >
        End Session
      </Button>
    </div>
  );
}
