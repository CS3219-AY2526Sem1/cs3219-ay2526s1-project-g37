import { Grid, Loader, Text, Button } from "@mantine/core";
import { formatTime } from "~/utils/utils";

type SearchingModalProps = {
  elapsedTime: number;
  leaveQueue: () => void;
};

export default function SearchingModal({
  elapsedTime,
  leaveQueue,
}: SearchingModalProps) {
  return (
    <Grid justify="center" align="center">
      <Grid.Col span={12} ta="center">
        <Loader color="white" />
      </Grid.Col>
      <Grid.Col span={12}>
        <Text size="xl" fw="700" ta="center" c="white">
          {formatTime(elapsedTime)}
        </Text>
      </Grid.Col>
      <Grid.Col span={12}>
        <Button fullWidth onClick={leaveQueue}>
          Cancel
        </Button>
      </Grid.Col>
    </Grid>
  );
}
