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
import { useUserService, type UserDetails } from '~/Services/UserService';

export function meta() {
  return [
    { title: "PeerPrep - User Page" },
    { name: "description", content: "View your interview history and manage sessions." },
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
  const [isAdmin, setIsAdmin] = useState(false);
  const { getCurrentUserDetails } = useUserService();

  const [data, setData] = useState<InterviewHistory[]>([]);

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
   * Effect to fetch current user details and determine admin status on component mount.
   */
  useEffect(() => {
    getCurrentUserDetails()
      .then((userData: UserDetails) => {
        setIsAdmin(userData.role === 1);
      })
      .catch((error: Error) => {
        console.error("Error fetching user details:", error);
        setIsAdmin(false);
      });
  }, [getCurrentUserDetails]);

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
      <Grid.Col span={{ base: 12, md: 10 }} offset={{ md: 1 }}>
        <Grid gutter="md" align="center">
          <DifficultyCards />
          <Grid.Col span={{ base: 12, md: 2 }} offset={{ md: 2 }}>
            {isAdmin && <Button 
              color="#dfdfdf" 
              style={{ marginBottom: "0.5rem" }} 
              fullWidth 
              onClick={() => navigation("/questions")}
            >
              Edit Questions
            </Button>}
            {inSession ? <Button color="orange" fullWidth onClick={handleReconnect}>Reconnect</Button> : <QueueModal />}
          </Grid.Col>
        </Grid>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 10 }} offset={{ md: 1 }}>
        <HistoryTable
          data={data}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </Grid.Col>
    </Grid>
  );
}
