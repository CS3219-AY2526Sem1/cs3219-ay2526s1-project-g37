import { Button, Grid } from '@mantine/core';

import HistoryTable, {
  type InterviewHistory,
} from '../Components/Tables/HistoryTable';
import QueueModal from '~/Components/QueueupModal/QueueModal';
import { useEffect, useState } from 'react';
import { useCollabService } from '~/Services/CollabService';
import { useQuestionService } from '~/Services/QuestionService';
import { useNavigate } from 'react-router';
import DifficultyCards from '~/Components/DifficultyCards/DifficultyCards';
import { useAuth } from '~/Context/AuthContext';

export function meta() {
  return [
    { title: 'PeerPrep - Homepage' },
    { name: 'description', content: 'Welcome to PeerPrep!' },
  ];
}

const PAGE_SIZE = 20;

/**
 * User Page component
 * @returns JSX.Element
 */
export default function UserPage() {
  const navigation = useNavigate();
  const { getSessionByUser } = useCollabService();
  const { getQuestionsListByUser } = useQuestionService();
  const [inSession, setInSession] = useState(false);
  const [userSessionId, setUserSessionId] = useState<string | null>(null);
  const { userId, tokenId } = useAuth();

  const [totalPages, setTotalPages] = useState<number>(1);
  const [data, setData] = useState<InterviewHistory[]>([
    {
      question: 'Two Sum',
      completionDate: '2024-10-01',
      difficulty: 'Easy',
      topic: 'Array',
      language: 'JavaScript',
    },
  ]);

  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    // Fetch questions list for user from the API
    const fetchQuestionsListByUser = async () => {
      try {
        const data = await getQuestionsListByUser(currentPage, userId);
        const questionsList: InterviewHistory[] = data.questions;
        console.log('Fetched questions history: ', questionsList);
        setData(questionsList);

        const totalCount: number = data.total_count;
        const totalPages = Math.ceil(totalCount / PAGE_SIZE);
        setTotalPages(totalPages);
      } catch (error) {
        console.error('Error fetching questions history: ', error);
      }
    };
    fetchQuestionsListByUser();
  }, [currentPage, tokenId]);

  /**
   * Effect to check if user is in an active session on component mount.
   */
  useEffect(() => {
    getSessionByUser()
      .then((responseData) => {
        if (responseData.in_session) {
          setInSession(true);
          setUserSessionId(responseData.session_id);
        }
      })
      .catch((error) => {
        console.error('Get Session by User Error:', error);
      });
  }, []);

  /**
   * Handle reconnecting to an active session
   */
  const handleReconnect = () => {
    if (userSessionId) {
      navigation(`/collab/${userSessionId}`);
    }
  };

  return (
    <Grid>
      <Grid.Col span={12}>
        <Grid gutter="md" align="center">
          <DifficultyCards />
          <Grid.Col span={{ base: 12, md: 2 }} offset={{ md: 2 }}>
            {inSession ? (
              <Button fullWidth onClick={handleReconnect}>
                Reconnect
              </Button>
            ) : (
              <QueueModal />
            )}
          </Grid.Col>
        </Grid>
      </Grid.Col>
      <Grid.Col span={12}>
        <HistoryTable
          data={data}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </Grid.Col>
    </Grid>
  );
}
