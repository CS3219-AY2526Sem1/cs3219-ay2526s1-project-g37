import { Grid, useMantineTheme } from "@mantine/core";
import StatsCard from "../StatsCard";
import { useEffect, useState } from "react";
import { useAuth } from "~/Context/AuthContext";
import { DIFFICULTYCOLOR } from "~/Constants/Constants";

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
            
            //set default values for difficulties with zero questions
            const difficulties = ["Easy", "Medium", "Hard"];
            const updatedStats: { [key: string]: number } = { ...data };
            difficulties.forEach((level) => {
                if (!updatedStats[level]) {
                    updatedStats[level] = 0;
                }
            });
            setQuestionStats(updatedStats);
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
          { questionStats && Object.keys(questionStats).map((level) => (
            <Grid.Col span={{ base: 6, md: 2 }} key={level}>
              <StatsCard 
                title={level}
                stat={questionStats[level]?.toString() || "0"}
                color={DIFFICULTYCOLOR[level]} 
              />
            </Grid.Col>
          ))}
        </>
    );
}
