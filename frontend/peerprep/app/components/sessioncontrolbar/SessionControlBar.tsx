import { Text, Button } from "@mantine/core";

export default function SessionControlBar(props: { user: string | null }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px", justifyContent: "center" }}>
      <Text fw={700}>
        Connected With:{" "}
        <span style={{ color: "var(--mantine-color-green-5)" }}>{props.user}</span>
      </Text>
      <Button
        color="var(--mantine-color-red-5)"
        c="white"
        size="compact-md"
        autoContrast
      >
        End Session
      </Button>
    </div>
  );
}
