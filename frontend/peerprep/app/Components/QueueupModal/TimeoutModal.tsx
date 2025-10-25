import { Button, Grid, Text } from "@mantine/core";

/**
 * Timeout Modal Props
 * @param handleQueue - Function to handle retry action
 */
type TimeoutModalProps = {
    handleQueue: () => void;
};

/**
 * Timeout Modal component
 * @param props - Props containing handleQueue
 * @returns JSX.Element
 */
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
