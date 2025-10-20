import { Button, Grid, Select } from "@mantine/core";
import { LANGUAGES } from "~/constants/constants";
import type { UseFormReturnType } from "@mantine/form";
import { useEffect, useState } from "react";
import { type Labels, getLabels } from "~/services/QuestionService";
import { useAuth } from "~/context/authContext";

type SelectionModalProps = {
    form: UseFormReturnType<{
        topic: string;
        difficulty: string;
        language?: string;
    }>;
    handleQueue: (values: {
        topic: string;
        difficulty: string;
        language?: string | undefined;
    }) => void;
};

export default function SelectionModal({ form, handleQueue }: SelectionModalProps) {
  const [labels, setLabels] = useState<Labels | null>(null);
  const { tokenId } = useAuth();

  useEffect(() => {
    getLabels(tokenId)
    .then((data) => setLabels(data))
    .catch((error) => {
        console.error("Error fetching labels:", error);
    });
  }, []);

  return (
        <form onSubmit={form.onSubmit((values) => handleQueue(values))}>
          <Grid>
            <Grid.Col span={12}>
              <Select
                label="Topic"
                placeholder="Pick values"
                data={labels?.topics || []}
                searchable
                {...form.getInputProps("topic")}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Select
                label="Difficulty"
                placeholder="Pick values"
                data={labels?.difficulties || []}
                searchable
                {...form.getInputProps("difficulty")}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Select
                label="Language"
                placeholder="Pick one"
                data={LANGUAGES}
                searchable
                {...form.getInputProps("language")}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Button fullWidth type="submit" mt="md">
                Confirm
              </Button>
            </Grid.Col>
          </Grid>
        </form>
      );
}
