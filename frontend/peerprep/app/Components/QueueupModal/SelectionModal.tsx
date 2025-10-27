import { Button, Grid, Select, Text } from "@mantine/core";
import { LANGUAGES } from "~/Constants/Constants";
import type { UseFormReturnType } from "@mantine/form";
import { useEffect, useState } from "react";
import { type Labels } from "~/Services/QuestionService";
import { useQuestionService } from "~/Services/QuestionService";

/**
 * Selection Modal Props
 * @param form - Form object for managing selection inputs
 * @param handleQueue - Function to handle queue action
 */
type SelectionModalProps = {
    form: UseFormReturnType<{
        topic: string;
        difficulty: string;
        language: string;
    }>;
    handleQueue: () => void;
};

/**
 * Selection Modal component
 * @param props - Props containing form and handleQueue
 * @returns JSX.Element
 */
export default function SelectionModal({ form, handleQueue }: SelectionModalProps) {
  const { getLabels, isValidQuestion } = useQuestionService();
  const [labels, setLabels] = useState<Labels | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Effect to fetch available labels (topics and difficulties) on component mount.
   */
  useEffect(() => {
    getLabels()
    .then((data) => setLabels(data))
    .catch((error) => {
        console.error("Error fetching labels:", error);
    });
  }, []);

  /**
   * Handle form submission to join the queue.
   * Validates the selected topic and difficulty before proceeding to queue.
   */
  const joinQueue = form.onSubmit(async (values) => {
    const res = await isValidQuestion(values.difficulty, values.topic);
    if (res) {
        setError(null);
        handleQueue();
    } else {
        setError("No questions available for the selected topic and difficulty. Please choose different options.");
    }
  });

  return (
        <form onSubmit={joinQueue} noValidate>
          <Grid>
            <Grid.Col span={12}>
              <Select
                label="Topic"
                placeholder="Pick values"
                data={labels?.topics || []}
                searchable
                {...form.getInputProps("topic")}
                required
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Select
                label="Difficulty"
                placeholder="Pick values"
                data={labels?.difficulties || []}
                searchable
                {...form.getInputProps("difficulty")}
                required
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Select
                label="Language"
                placeholder="Pick one"
                data={LANGUAGES}
                searchable
                {...form.getInputProps("language")}
                required
              />
            </Grid.Col>
            {error && (
              <Grid.Col span={12}>
                <Text c="red" ta="center">{error}</Text>
              </Grid.Col>
            )}
            <Grid.Col span={12}>
              <Button fullWidth type="submit" mt="md">
                Confirm
              </Button>
            </Grid.Col>
          </Grid>
        </form>
      );
}
