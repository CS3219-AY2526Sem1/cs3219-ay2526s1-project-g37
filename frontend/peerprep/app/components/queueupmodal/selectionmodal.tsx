import { Button, Grid, Select } from "@mantine/core";
import { LANGUAGES } from "~/constants/constants";
import type { UseFormReturnType } from "@mantine/form";
import { useEffect, useState } from "react";
import { type Labels, getLabels } from "~/services/QuestionService";

type SelectionModalProps = {
    form: UseFormReturnType<{
        topic: string;
        difficulty: string;
        language: string;
    }>;
    handleQueue: (values: {
        topic: string;
        difficulty: string;
        language: string;
    }) => void;
};

export default function SelectionModal({ form, handleQueue }: SelectionModalProps) {
  const [labels, setLabels] = useState<Labels | null>(null);

  useEffect(() => {
    getLabels().then((data) => setLabels(data));
  }, []);

  return (
        <form onSubmit={form.onSubmit((values) => handleQueue(values))} noValidate>
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
            <Grid.Col span={12}>
              <Button fullWidth type="submit" mt="md">
                Confirm
              </Button>
            </Grid.Col>
          </Grid>
        </form>
      );
}
