import { Button, Card, Divider, Table, Text, Pagination, Group } from "@mantine/core";
import classes from "./table.module.css";

export default function HistoryTable({ data }: { data: any[] }) {
  const rows = data.map((row, index) => (
    <Table.Tr key={row.name}>
      <Table.Td>{row.question}</Table.Td>
      <Table.Td ta="right">{row.completionDate}</Table.Td>
      <Table.Td ta="right">{row.difficulty}</Table.Td>
      <Table.Td ta="right">{row.topic}</Table.Td>
      <Table.Td ta="right">{row.language}</Table.Td>
      <Table.Td ta="right" style={{ width: 100 }}>
        <Button>View</Button>
      </Table.Td>
    </Table.Tr>
  ));
  return (
    <Card shadow="sm" padding="lg">
      <Text fw={1000} size="xl" c="white" mb={"xs"}>
        Interviews
      </Text>
      <Divider />
      <Table.ScrollContainer minWidth={500}>
        <Table c={"white"} highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Question</Table.Th>
              <Table.Th className={classes.cell}>Completion Date</Table.Th>
              <Table.Th className={classes.cell}>Difficulty</Table.Th>
              <Table.Th className={classes.cell}>Topic</Table.Th>
              <Table.Th className={classes.cell}>Language</Table.Th>
              <Table.Th className={classes.cell}></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Table.ScrollContainer>
      <Group justify="center">
      <Pagination total={5} siblings={3} defaultValue={1} />

      </Group>
    </Card>
  );
}
