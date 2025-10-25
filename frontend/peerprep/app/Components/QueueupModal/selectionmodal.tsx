import { Button, Grid, Select, Text } from "@mantine/core";
import { LANGUAGES } from "~/Constants/constants";
import type { UseFormReturnType } from "@mantine/form";
import { useEffect, useState } from "react";
import { type Labels } from "~/Services/QuestionService";
import { useQuestionService } from "~/Services/QuestionService";

type SelectionModalProps = {
    form: UseFormReturnType<{
        topic: string;
        difficulty: string;
        language: string;
    }>;
    handleQueue: () => void;
};

export default function SelectionModal({ form, handleQueue }: SelectionModalProps) {
  const [labels, setLabels] = useState<Labels | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { getLabels, isValidQuestion } = useQuestionService();

  useEffect(() => {
    getLabels()
    .then((data) => setLabels(data))
    .catch((error) => {
        console.error("Error fetching labels:", error);
    });
  }, []);

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
