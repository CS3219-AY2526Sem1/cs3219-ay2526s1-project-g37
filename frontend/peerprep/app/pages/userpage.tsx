import {
  Button,
  Grid,
  useMantineTheme,
} from "@mantine/core";

import HistoryTable from "~/Components/table/table";
import type { InterviewHistory } from "~/Components/table/table";
import QueueModal from "~/Components/QueueupModal/queuemodal";
import { useEffect, useState } from "react";
import { useCollabService } from "~/Services/CollabService";
import { useNavigate } from "react-router";
import DifficultyCards from "~/Components/difficultycards/DifficultyCards";

export function meta() {
    return [{ title: "PeerPrep - Homepage" }, { name: "description", content: "Welcome to PeerPrep!" }];
}

export default function Userpage() {
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
