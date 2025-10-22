import {
  Grid,
  Loader,
  Center,
  Text,
} from "@mantine/core";

import HistoryTable from "../components/table/table";
import type { InterviewHistory } from "../components/table/table";
import QueueModal from "~/components/queueupmodal/queuemodal";

import { useAuth } from "~/context/authContext";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import DifficultyCards from "~/components/difficultycards/DifficultyCards";

export function meta() {
    return [{ title: "PeerPrep - Homepage" }, { name: "description", content: "Welcome to PeerPrep!" }];
}

export default function Userpage() {
  const { userId, tokenId } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
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
    const checkUserSession = async () => {
      const collabUrl = `${import.meta.env.VITE_AUTH_ROUTER_URL}/collaboration`;
      try {
        const response = await fetch(`${collabUrl}/sessions?user_id=${userId}`, {
          headers: {
            "Authorization": `Bearer ${tokenId}`,
            "Content-Type": "application/json",
          }
        });
        if (response.ok) {
          const data = await response.json();
          const sessionId = data.session_id;
          if (sessionId) {
            navigate(`/collab/${sessionId}`);
            return; // stop and let navigation happen
          }
        } 
      } catch (error) {
        console.error("Error checking user session:", error);
      }
      // no session found — stop loading and render page
      setLoading(false);
    };
    checkUserSession();
  }, [userId, tokenId, navigate]);
  
  if (loading) {
    return (
      <Center style={{ minHeight: "100vh" }}>
        <Loader />
        <Text ml="md">Checking session...</Text>
      </Center>
    );
  }
  
  return (
    <Grid>
      <Grid.Col span={12}>
        <Grid gutter="md" align="center">
          <DifficultyCards />
          <Grid.Col span={{ base: 12, md: 2 }} offset={{ md: 2 }}>
            <QueueModal />
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
