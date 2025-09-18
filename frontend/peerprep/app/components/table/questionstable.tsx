import { Button, Card, Divider, Table, Text, Pagination, Group, Input } from "@mantine/core";
import classes from "./table.module.css";

export type QuestionHistory = {
  question: string;
  dateAdded: string;
  lastEdited: string;
  difficulty: string;
  topic: string;
};

export default function QuestionsTable({ data }: { data: QuestionHistory[] }) {
  const rows = data.map((row) => (
    <Table.Tr key={row.question}>
      <Table.Td>{row.question}</Table.Td>
      <Table.Td ta="right">{row.dateAdded}</Table.Td>
      <Table.Td ta="right">{row.lastEdited}</Table.Td>
      <Table.Td ta="right">{row.difficulty}</Table.Td>
      <Table.Td ta="right">{row.topic}</Table.Td>
      <Table.Td ta="right" style={{ width: 50 }}>
        <Button>Edit</Button>
      </Table.Td>
      <Table.Td ta="right" style={{ width: 50 }}>
        <Button>Delete</Button>
      </Table.Td>
    </Table.Tr>
  ));
  return (
    <Card shadow="sm" padding="lg">
      <Group justify="space-between">
        <Text fw={1000} size="xl" c="white" mb={"xs"}>
          Questions
        </Text>
        <Input placeholder="Search" />
      </Group>
      
      <Divider />
      <Table.ScrollContainer minWidth={500}>
        <Table c={"white"} highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Question</Table.Th>
              <Table.Th className={classes.cell}>Date Added</Table.Th>
              <Table.Th className={classes.cell}>Last Edited</Table.Th>
              <Table.Th className={classes.cell}>Difficulty</Table.Th>
              <Table.Th className={classes.cell}>Topic</Table.Th>
              <Table.Th className={classes.cell} style={{ width: 50 }}></Table.Th>
              <Table.Th className={classes.cell} style={{ width: 50 }}></Table.Th>
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
