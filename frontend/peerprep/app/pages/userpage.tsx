import {
  Button,
  Grid,
  useMantineTheme,
} from "@mantine/core";

import StatsCard from "../Components/StatsCard";
import HistoryTable, { type InterviewHistory } from "../Components/Tables/HistoryTable";
import QueueModal from "~/Components/QueueupModal/QueueModal";
import { useEffect, useState } from "react";
import { useCollabService } from "~/Services/CollabService";
import { useNavigate } from "react-router";

export function meta() {
    return [{ title: "PeerPrep - Homepage" }, { name: "description", content: "Welcome to PeerPrep!" }];
}

/**
 * User Page component
 * @returns JSX.Element
 */
export default function UserPage() {
  const theme = useMantineTheme();
  const navigation = useNavigate();
  const { getSessionByUser } = useCollabService();
  const [inSession, setInSession] = useState(false);
  const [userSessionId, setUserSessionId] = useState<string | null>(null);

  const [data, ] = useState<InterviewHistory[]>([
    {
      question: "Two Sum",
      completionDate: "2024-10-01",
      difficulty: "Easy",
      topic: "Array",
      language: "JavaScript",
    },
  ]);

  /**
   * Effect to check if user is in an active session on component mount.
   */
  useEffect(() => {
    getSessionByUser().then((responseData) => {
      if (responseData.in_session) {
        setInSession(true);
        setUserSessionId(responseData.session_id);
      }
    }).catch((error) => {
      console.error("Get Session by User Error:", error);
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
          <Grid.Col span={{ base: 6, md: 2 }}>
            <StatsCard
              title="Interviews"
              stat="1,234"
              color={theme.colors.gray[0]}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 6, md: 2 }}>
            <StatsCard
              title="Easy"
              stat="1,234"
              color={theme.colors.green[5]}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 6, md: 2 }}>
            <StatsCard
              title="Medium"
              stat="1,234"
              color={theme.colors.yellow[5]}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 6, md: 2 }}>
            <StatsCard title="Hard" stat="1,234" color={theme.colors.red[5]} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 2 }} offset={{ md: 2 }}>
            {inSession ? <Button fullWidth onClick={handleReconnect}>Reconnect</Button> : <QueueModal />}
          </Grid.Col>
        </Grid>
      </Grid.Col>
      <Grid.Col span={12}>
        <HistoryTable
          data={data}
        />
      </Grid.Col>
    </Grid>
  );
}
