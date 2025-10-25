import { Card, Text } from "@mantine/core";

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
