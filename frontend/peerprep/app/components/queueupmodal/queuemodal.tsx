import { useDisclosure } from "@mantine/hooks";
import { Modal, Button, MultiSelect, Grid, Select } from "@mantine/core";
import { useForm } from "@mantine/form";
import { DIFFICULTIES, LANGUAGES, TOPICS } from "~/constants/constants";

export default function QueueModal() {
  const [opened, { open, close }] = useDisclosure(false);
  const form = useForm({
    initialValues: {
      topic: [],
      difficulty: [],
    },
  });

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        c="white"
        title="Select Topic and Difficulty"
      >
        <form onSubmit={form.onSubmit((values) => console.log(values))}>
          <Grid>
            <Grid.Col span={12}>
              <MultiSelect
                label="Topic"
                placeholder="Pick values"
                data={TOPICS}
                searchable
                {...form.getInputProps("topic")}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <MultiSelect
                label="Difficulty"
                placeholder="Pick values"
                data={DIFFICULTIES}
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
              <Button fullWidth type="submit" mt="md" onClick={close}>
                Confirm
              </Button>
            </Grid.Col>
          </Grid>
        </form>
      </Modal>
      <Button fullWidth onClick={open}>
        Queue Up
      </Button>
    </>
  );
}
