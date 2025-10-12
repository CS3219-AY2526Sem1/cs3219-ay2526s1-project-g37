import { Button, Grid, Text } from "@mantine/core";

type TimeoutModalProps = {
    setQueueStatus: (status: "idle" | "searching" | "timeout" | "found") => void;
};

export default function TimeoutModal({ setQueueStatus }: TimeoutModalProps) {
  return (
      <Grid justify="center" align="center">
        <Grid.Col span={12} ta="center">
          <Text size="xl" fw="700" ta="center" c="white">
            No match found. Please try again.
          </Text>
        </Grid.Col>
        <Grid.Col span={12}>
          <Button fullWidth onClick={() => setQueueStatus("idle")}>
            Retry
          </Button>
        </Grid.Col>
      </Grid>
  );
}
