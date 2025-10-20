import {
  Grid,
  Button,
  TextInput,
  MultiSelect,
  Card,
  Select,
  TypographyStylesProvider,
  Textarea,
  Text,
  Pill,
  Group,
} from "@mantine/core";

import { useForm } from "@mantine/form";
import CustomRichTextEditor from "../components/richtexteditor/CustomRichTextEditor";
import { DIFFICULTIES, TOPICS, DIFFICULTYCOLOR } from "~/constants/constants";
import { CARDHEIGHT } from "~/constants/constants";

export default function AddQuestionPage() {
  const form = useForm({
    initialValues: {
      title: "",
      topic: [],
      difficulty: "",
      problem: "",
      testCases: "",
    },
  });

  return (
    <>
      <form onSubmit={form.onSubmit((values) => console.log(values))}>
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }} style={{ height: "100%" }}>
            <Card style={{ height: CARDHEIGHT, overflowY: "auto" }}>
              <Grid gutter="sm">
                <Grid.Col span={12}>
                  <TextInput
                    label="Question Title"
                    placeholder="Enter question title"
                    {...form.getInputProps("title")}
                    required
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <MultiSelect
                    label="Topic"
                    placeholder="Select topics"
                    data={TOPICS}
                    searchable
                    required
                    {...form.getInputProps("topic")}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <Select
                    label="Difficulty"
                    placeholder="Select difficulty"
                    data={DIFFICULTIES}
                    searchable
                    required
                    {...form.getInputProps("difficulty")}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <CustomRichTextEditor
                    value={form.values.problem}
                    onChange={(value) => form.setFieldValue("problem", value)}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <Textarea
                    label="Test Cases"
                    placeholder="Enter test cases"
                    required
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <Button type="submit" fullWidth>
                    Submit
                  </Button>
                </Grid.Col>
              </Grid>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card style={{ height: CARDHEIGHT, overflowY: "auto" }} c={"white"}>
              <Text size="xl" fw={700}>
                {form.values.title}
              </Text>
              <Group mb="md" mt="md" gap={8}>
                {form.values.topic.map((topic) => (
                  <Pill key={topic}>{topic}</Pill>
                ))}
              </Group>
              <Text
                size="md"
                fw={500}
                c={DIFFICULTYCOLOR[form.values.difficulty]}
                mb="md"
              >
                {form.values.difficulty}
              </Text>
              {/* html from markdown is purified using DOMPurify to sanitise xss and other injections */}
              <TypographyStylesProvider>
                <div
                  dangerouslySetInnerHTML={{ __html: form.values.problem }}
                />
              </TypographyStylesProvider>
            </Card>
          </Grid.Col>
        </Grid>
      </form>
    </>
  );
}
