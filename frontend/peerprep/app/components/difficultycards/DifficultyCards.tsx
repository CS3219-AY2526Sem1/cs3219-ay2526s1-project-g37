import { Grid, useMantineTheme } from "@mantine/core";
import StatsCard from "../statscard";
import { useEffect, useState } from "react";
import { useAuth } from "~/context/authContext";

const EASY_LABEL = "Easy";
const MEDIUM_LABEL = "Medium";
const HARD_LABEL = "Hard";

export default function DifficultyCards() {
    const theme = useMantineTheme();
    const { tokenId } = useAuth();
    const [questionStats, setQuestionStats] = useState<{ [key: string]: number }>({});

    const getTotalQuestions = () => {
        return Object.values(questionStats).reduce((acc, curr) => acc + curr, 0);
    }

    useEffect(() => {
        // get total questions count for each difficulty
        const fetchTotalQuestionsCount = async () => {
        const questionsUrl = `${import.meta.env.VITE_AUTH_ROUTER_URL}/questions`;
        try {
            const response = await fetch(`${questionsUrl}/questions/stats`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${tokenId}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch total questions count");
            }

            const data = await response.json();
            console.log("Fetched question stats:", data);
            setQuestionStats(data);
            
        } catch (error) {
            console.error("Error fetching total questions count:", error);
        }};
        fetchTotalQuestionsCount();
    }, []);

    return (
        <>
          <Grid.Col span={{ base: 6, md: 2 }}>
            <StatsCard
              title="Total Questions"
              stat={getTotalQuestions().toString() || "0"}
              color={theme.colors.gray[0]}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 6, md: 2 }}>
            <StatsCard
              title="Easy"
              stat={questionStats[EASY_LABEL]?.toString() || "0"}
              color={theme.colors.green[5]}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 6, md: 2 }}>
            <StatsCard
              title="Medium"
              stat={questionStats[MEDIUM_LABEL]?.toString() || "0"}
              color={theme.colors.yellow[5]}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 6, md: 2 }}>
            <StatsCard 
              title="Hard" 
              stat={questionStats[HARD_LABEL]?.toString() || "0"} 
              color={theme.colors.red[5]} 
            />
          </Grid.Col>
        </>
    );
}
