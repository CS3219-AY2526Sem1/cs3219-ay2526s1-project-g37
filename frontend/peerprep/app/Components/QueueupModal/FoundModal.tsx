import { Grid, Text } from "@mantine/core";

/**
 * Found Modal Props
 * @param redirectCountdown - Countdown in seconds before redirect
 */
type FoundModalProps = {
  redirectCountdown: number;
};

/**
 * Found Modal component
 * @param props - Props containing redirectCountdown
 * @returns JSX.Element
 */
export default function FoundModal({ redirectCountdown }: FoundModalProps) {
  return (
    <Grid justify="center" align="center">
      <Grid.Col span={12} ta="center">
        <Text size="xl" fw="700" ta="center" c="white">
          Match found!
        </Text>
      </Grid.Col>
      <Grid.Col span={12}>
        <Text size="xl" fw="700" ta="center" c="white">
          Redirecting in {redirectCountdown} seconds...
        </Text>
      </Grid.Col>
    </Grid>
  );
}
