import { Card, Text } from "@mantine/core";

/**
 * Stats Card component
 * @param title - Title of the stat
 * @param stat - Stat value
 * @param color - Color for the title text
 * @returns JSX.Element
 */
export default function StatsCard({
  title,
  stat,
  color,
}: {
  title: string;
  stat: string;
  color: string;
}) {
  return (
    <Card shadow="sm" padding="lg">
      <Text fw={700} ta="center" c="white">{stat}</Text>
      <Text c={color} ta="center">{title}</Text>
    </Card>
  );
}
