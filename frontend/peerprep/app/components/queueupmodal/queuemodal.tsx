import { useDisclosure } from "@mantine/hooks";
import { Modal, Button, MultiSelect, Grid, Select } from "@mantine/core";
import { useForm } from "@mantine/form";
import classes from "./queuemodal.module.css";

const topics = [
  "Array",
  "String",
  "Dynamic Programming",
  "Backtracking",
  "Greedy",
  "Graph",
  "Tree",
  "Linked List",
  "Sorting",
  "Searching",
];

const difficulties = ["Easy", "Medium", "Hard"];

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
                data={topics}
                searchable
                {...form.getInputProps("topic")}
                classNames={{
                  pill: classes.pill,
                }}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <MultiSelect
                label="Difficulty"
                placeholder="Pick values"
                data={difficulties}
                searchable
                {...form.getInputProps("difficulty")}
                classNames={{
                  pill: classes.pill,
                }}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Select
                label="Language"
                placeholder="Pick one"
                data={["C++", "Python", "Java", "JavaScript"]}
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
