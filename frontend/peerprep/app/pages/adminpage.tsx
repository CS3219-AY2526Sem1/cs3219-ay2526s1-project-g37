import {
  Grid,
  useMantineTheme,
  Button
} from "@mantine/core";

import StatsCard from "../components/statscard";
import QuestionsTable from "~/components/table/questionstable";
import type {QuestionHistory} from "../components/table/questionstable";

import { useState } from "react";

export function meta() {
  return [
    { title: "PeerPrep - Homepage" },
    { name: "description", content: "Welcome to PeerPrep!" },
  ];
}

export default function Userpage() {
  const theme = useMantineTheme();

  const [data, ] = useState<QuestionHistory[]>([
    {
        question: "Two Sum",
        dateAdded: "2024-10-01",
        lastEdited: "2024-10-01",
        difficulty: "Easy",
        topic: "Array",
    },
  ]);

  return (
    <Grid>
      <Grid.Col span={12}>
        <Grid gutter="md" align="center">
          <Grid.Col span={{ base: 6, md: 2 }}>
            <StatsCard
              title="Total Questions"
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
            <Button fullWidth onClick={() => {}}>Add Question</Button>
          </Grid.Col>
        </Grid>
      </Grid.Col>
      <Grid.Col span={12}>
        <QuestionsTable
          data={data}
        />
      </Grid.Col>
    </Grid>
  );
}
