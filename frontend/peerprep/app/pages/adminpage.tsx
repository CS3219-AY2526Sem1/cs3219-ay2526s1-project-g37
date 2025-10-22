import {
  Grid,
  useMantineTheme,
  Button
} from "@mantine/core";

import { Link } from "react-router";

import StatsCard from "../components/statscard";
import QuestionsTable from "~/components/table/questionstable";
import type {QuestionHistory} from "../components/table/questionstable";

import { useEffect, useState } from "react";
import { useAuth } from "~/context/authContext";
import { useDebouncedValue } from "@mantine/hooks";
import DifficultyCards from "~/components/difficultycards/DifficultyCards";

export function meta() {
  return [
    { title: "PeerPrep - Homepage" },
    { name: "description", content: "Welcome to PeerPrep!" },
  ];
}
const PAGE_SIZE = 20;

export default function Adminpage() {
  const { tokenId } = useAuth();
  const [totalPages, setTotalPages] = useState<number>(1);
  const [data, setData] = useState<QuestionHistory[]>([    
    {
        name: "Two Sum",
        dateAdded: "2024-10-01",
        lastEdited: "2024-10-01",
        difficulty: "Easy",
        topic: "Array",
    },
  ]);


  const [currentPage, setCurrentPage] = useState<number>(1);

  // Debounce search query to avoid excessive API calls
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 500);

  useEffect(() => {
    // Fetch the questions list from the API
    const fetchQuestionsList = async () => {

      const questionsUrl = `${import.meta.env.VITE_AUTH_ROUTER_URL}/questions`;
      try {
        const response = await fetch(`${questionsUrl}/questions?page=${currentPage}&search=${debouncedSearchQuery}`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${tokenId}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch questions");
        }
        const data = await response.json();
        const questionsList: QuestionHistory[] = data.questions;
        console.log("Fetched questions:", questionsList);
        setData(questionsList);
        const totalCount: number = data.total_count;
        const totalPages = Math.ceil(totalCount / PAGE_SIZE);
        setTotalPages(totalPages);
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };
    fetchQuestionsList();
  }, [currentPage, debouncedSearchQuery, tokenId]);



  return (
    <Grid>
      <Grid.Col span={12}>
        <Grid gutter="md" align="center">
          <DifficultyCards />
          <Grid.Col span={{ base: 12, md: 2 }} offset={{ md: 2 }}>
            <Link to="/questions/add">
              <Button fullWidth>Add Question</Button>
            </Link>
          </Grid.Col>
        </Grid>
      </Grid.Col>
      <Grid.Col span={12}>
        <QuestionsTable
          data={data}
          totalPages={totalPages}
          onSearchQueryChange={(query) => setSearchQuery(query)}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </Grid.Col>
    </Grid>
  );
}
