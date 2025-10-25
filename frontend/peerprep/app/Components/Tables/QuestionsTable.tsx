import { Button, Card, Divider, Table, Text, Pagination, Group, Input } from "@mantine/core";
import classes from "./Table.module.css";

/**
 * Question History type definition
 */
export type QuestionHistory = {
  id: string;
  name: string;
  dateAdded: string;
  lastEdited: string;
  difficulty: string;
  topic: string;
};

interface QuestionsTableProps {
  data: QuestionHistory[];
  totalPages: number;
  onSearchQueryChange: (query: string) => void;
  onPageChange: (page: number) => void;
  handleEdit: (id: string) => void;
  handleDelete: (id: string) => void;
}

/**
 * QuestionsTable component to display a table of questions
 * @param props - Props containing data, totalPages, onSearchQueryChange, and onPageChange
 * @returns JSX.Element
 */
export default function QuestionsTable({ data, totalPages, onSearchQueryChange, onPageChange, handleEdit, handleDelete }: QuestionsTableProps) {

  const rows = data.map((row) => (
    <Table.Tr key={row.name}>
      <Table.Td>{row.name}</Table.Td>
      {/* <Table.Td ta="right">{row.dateAdded}</Table.Td>
      <Table.Td ta="right">{row.lastEdited}</Table.Td> */}
      <Table.Td ta="right">{row.difficulty}</Table.Td>
      <Table.Td ta="right">{row.topic}</Table.Td>
      <Table.Td ta="right" style={{ width: 50 }}>
        <Button onClick={() => handleEdit(row.id)}>Edit</Button>
      </Table.Td>
      <Table.Td ta="right" style={{ width: 50 }}>
        <Button onClick={() => handleDelete(row.id)}>Delete</Button>
      </Table.Td>
    </Table.Tr>
  ));
  return (
    <Card shadow="sm" padding="lg">
      <Group justify="space-between">
        <Text fw={1000} size="xl" c="white" mb={"xs"}>
          Questions
        </Text>
        <Input placeholder="Search" onChange={(e) => onSearchQueryChange(e.currentTarget.value)} />
      </Group>
      
      <Divider />
      <Table.ScrollContainer minWidth={500}>
        <Table c={"white"} highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Question</Table.Th>
              {/* <Table.Th className={classes.cell}>Date Added</Table.Th>
              <Table.Th className={classes.cell}>Last Edited</Table.Th> */}
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
      <Pagination total={totalPages} siblings={3} defaultValue={1} onChange={onPageChange} />

      </Group>
    </Card>
  );
}
