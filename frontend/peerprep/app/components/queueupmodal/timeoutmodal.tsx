import { Button, Grid, Text } from "@mantine/core";

type TimeoutModalProps = {
    handleQueue: () => void;
};

export default function TimeoutModal({ handleQueue }: TimeoutModalProps) {
  return (
      <Grid justify="center" align="center">
        <Grid.Col span={12} ta="center">
          <Text size="xl" fw="700" ta="center" c="white">
            No match found. Please try again.
          </Text>
        </Grid.Col>
        <Grid.Col span={12}>
          <Button fullWidth onClick={handleQueue}>
            Retry
          </Button>
        </Grid.Col>
      </Grid>
  );
}
