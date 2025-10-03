import { Text, Button } from "@mantine/core";

export default function SessionControlBar() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px", justifyContent: "center" }}>
      <Text fw={700}>
        Connected With:{" "}
        <span style={{ color: "var(--mantine-color-green-5)" }}>User123</span>
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
