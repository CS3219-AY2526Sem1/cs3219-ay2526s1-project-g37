import { Grid, useMantineTheme } from "@mantine/core";
import StatsCard from "../StatsCard";
import { useEffect, useState } from "react";
import { DIFFICULTYCOLOR, STAT_DIFFICULTIES } from "~/Constants/Constants";
import { useQuestionService } from "~/Services/QuestionService";

export default function DifficultyCards() {
    const theme = useMantineTheme();
    const [questionStats, setQuestionStats] = useState<{ [key: string]: number }>({});
    const { fetchQuestionStats } = useQuestionService();

    const getTotalQuestions = () => {
        return Object.values(questionStats).reduce((acc, curr) => acc + curr, 0);
    }

    useEffect(() => {
        (async () => {      
            const data = await fetchQuestionStats();
            console.log("Fetched question stats:", data);
            
            //set default values for difficulties with zero questions
            const updatedStats: { [key: string]: number } = { ...data };
            STAT_DIFFICULTIES.forEach((level) => {
                if (!updatedStats[level]) {
                    updatedStats[level] = 0;
                }
            });
            setQuestionStats(updatedStats);
        })();
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
