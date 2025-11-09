import { Badge, Text } from "@mantine/core";

interface CustomBadgeProps {
  label: string;
  value: string;
  color?: string;
  paddingRight?: string;
}

/**
 * Generic Badge component to display a label and value
 * @param props - Props containing label, value, and optional color
 * @returns JSX.Element - Badge component
 */
export default function CustomBadge({ label, value, color = "grey", paddingRight }: CustomBadgeProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "8px",
        paddingBottom: "8px",
        paddingRight: paddingRight,
      }}
    >
      <Text>{label}:</Text>
      <Badge color={color} variant="filled" size="lg" style={{ marginBottom: "0" }}>
        {value}
      </Badge>
    </div>
  );
}
