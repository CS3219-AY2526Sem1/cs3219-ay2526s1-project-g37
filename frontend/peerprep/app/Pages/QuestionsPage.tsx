import { Grid, Button } from "@mantine/core";

import { useNavigate } from "react-router";

import QuestionsTable from "~/Components/Tables/QuestionsTable";
import type { QuestionHistory } from "../Components/Tables/QuestionsTable";

import { useEffect, useState } from "react";
import { useAuth } from "~/Context/AuthContext";
import { useDebouncedValue } from "@mantine/hooks";
import { useQuestionService } from "~/Services/QuestionService";
import { notifications } from "@mantine/notifications";
import DifficultyCards from "~/Components/DifficultyCards/DifficultyCards";
import { PAGE_SIZE } from "~/Constants/Constants";

export function meta() {
  return [
    { title: "PeerPrep - Questions" },
    { name: "description", content: "Browse and manage coding questions." },
  ];
}

/**
 * Questions Page component
 * @returns JSX.Element
 */
export default function QuestionsPage() {
  const { tokenId } = useAuth();
  const navigation = useNavigate();
  const { getQuestionsList, deleteQuestion } = useQuestionService();
  const [totalPages, setTotalPages] = useState<number>(1);
  const [data, setData] = useState<QuestionHistory[]>([
    {
      id: "test-id-1",
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
      try {
        const data = await getQuestionsList(
          currentPage,
          PAGE_SIZE,
          debouncedSearchQuery
        );
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

  function handleEdit(id: string) {
    console.log("Edit question with id:", id);
    navigation(`/questions/edit/${id}`);
  }

  function handleDelete(id: string) {
    console.log("Delete question with id:", id);
    deleteQuestion(id)
      .then(() => {
        notifications.show({
          title: "Success",
          message: "Question deleted successfully!",
          color: "green",
          withBorder: true,
        });
        // Refresh the questions list after deletion
        setData((prevData) =>
          prevData.filter((question) => question.id !== id)
        );
      })
      .catch((error) => {
        console.error("Error deleting question:", error);
        notifications.show({
          title: "Error",
          message: "Failed to delete question. Please try again.",
          color: "red",
          withBorder: true,
        });
      });
  }

  return (
    <Grid>
      <Grid.Col span={{ base: 12, md: 10 }} offset={{ md: 1 }}>
        <Grid gutter="md" align="center">
          <DifficultyCards />
          <Grid.Col span={{ base: 12, md: 2 }} offset={{ md: 2 }}>
            <Button
              color="#dfdfdf"
              style={{ marginBottom: "0.5rem" }}
              fullWidth
              onClick={() => navigation("/user")}
            >
              {" "}
              Back to Homepage
            </Button>
            <Button fullWidth onClick={() => navigation("/questions/add")}>
              Add Question
            </Button>
          </Grid.Col>
        </Grid>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 10 }} offset={{ md: 1 }}>
        <QuestionsTable
          data={data}
          totalPages={totalPages}
          onSearchQueryChange={(query) => setSearchQuery(query)}
          onPageChange={(page) => setCurrentPage(page)}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />
      </Grid.Col>
    </Grid>
  );
}
