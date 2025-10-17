import { Button, Grid, Select } from "@mantine/core";
import { DIFFICULTIES, LANGUAGES, TOPICS } from "~/constants/constants";
import type { UseFormReturnType } from "@mantine/form";

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
  return (
        <form onSubmit={form.onSubmit((values) => handleQueue(values))} noValidate>
          <Grid>
            <Grid.Col span={12}>
              <Select
                label="Topic"
                placeholder="Pick values"
                data={TOPICS}
                searchable
                {...form.getInputProps("topic")}
                required
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Select
                label="Difficulty"
                placeholder="Pick values"
                data={DIFFICULTIES}
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
