import {
  Grid,
  Button,
  useMantineTheme,
} from "@mantine/core";

import StatsCard from "../components/statscard";
import HistoryTable from "../components/table/table";
import type {InterviewHistory} from "../components/table/table";
import QueueModal from "~/components/queueupmodal/queuemodal";

import { useState } from "react";

export function meta() {
  return [
    { title: "PeerPrep - Homepage" },
    { name: "description", content: "Welcome to PeerPrep!" },
  ];
}

export default function Userpage() {
  const theme = useMantineTheme();

  const [data, ] = useState<InterviewHistory[]>([
    {
      question: "Two Sum",
      completionDate: "2024-10-01",
      difficulty: "Easy",
      topic: "Array",
      language: "JavaScript",
    },
  ]);

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
