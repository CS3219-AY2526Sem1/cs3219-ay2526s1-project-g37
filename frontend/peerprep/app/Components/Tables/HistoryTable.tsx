import {
  Button,
  Card,
  Divider,
  Table,
  Text,
  Pagination,
  Group,
} from '@mantine/core';
import classes from './Table.module.css';
import { useNavigate } from 'react-router';

/**
 * Interview History type definition
 */
export type InterviewHistory = {
  id: string;
  question: string;
  completionDate: string;
  difficulty: string;
  topic: string;
  language: string;
  question_id: string;
  submitted_solution?: string;
};

interface HistoryTableProps {
  data: InterviewHistory[];
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * HistoryTable component to display interview history
 * @param data - Array of InterviewHistory objects
 * @returns JSX.Element
 */
export default function HistoryTable({
  data,
  totalPages,
  onPageChange,
}: HistoryTableProps) {
  const navigate = useNavigate();
  const viewSubmission = (id: string) => {
    navigate(`/user/submissions/${id}`);
  };

  const rows = data.map((row) => (
    <Table.Tr key={row.id}>
      <Table.Td>{row.question}</Table.Td>
      <Table.Td ta="right">{row.completionDate}</Table.Td>
      <Table.Td ta="right">{row.difficulty}</Table.Td>
      <Table.Td ta="right">{row.topic}</Table.Td>
      <Table.Td ta="right">{row.language}</Table.Td>
      <Table.Td ta="right" style={{ width: 100 }}>
        <Button onClick={() => viewSubmission(row.id)}>View</Button>
      </Table.Td>
    </Table.Tr>
  ));
  return (
    <Card shadow="sm" padding="lg">
      <Text fw={1000} size="xl" c="white" mb={'xs'}>
        Interviews
      </Text>
      <Divider />
      { data.length === 0 ? (
        <Text align="center" mt="md">
          No interview history found, start a new session today!
        </Text>
      ) : (
        <>
          <Table.ScrollContainer minWidth={500}>
            <Table c={'white'} highlightOnHover>
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
            <Pagination
              total={totalPages}
              siblings={3}
              defaultValue={1}
              onChange={onPageChange}
            />
          </Group>
        </>
      )}
    </Card>
  );
}
