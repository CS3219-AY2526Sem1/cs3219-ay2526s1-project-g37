import {
  Grid,
  Button,
  TextInput,
  MultiSelect,
  Card,
  Select,
  TypographyStylesProvider,
  Textarea,
} from "@mantine/core";

import { useForm } from "@mantine/form";
import CustomRichTextEditor from "../components/richtexteditor/CustomRichTextEditor";

export default function AddQuestionPage() {
  const form = useForm({
    initialValues: {
      title: "",
      topic: [],
      difficulty: "",
      problem: "<ul> <li>Item 1</li> <li>Item 2</li> </ul>",
      testCases: "",
    },
  });

  const cardHeight = "calc(100vh - 95px)";

  return (
    <>
      <form onSubmit={form.onSubmit((values) => console.log(values))}>
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }} style={{ height: "100%" }}>
            <Card style={{ height: cardHeight, overflowY: "auto" }}>
              <Grid gutter="sm">
                <Grid.Col span={12}>
                  <TextInput
                    label="Question Title"
                    placeholder="Enter question title"
                    required
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <MultiSelect
                    label="Topic"
                    placeholder="Select topics"
                    data={[
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
                    ]}
                    searchable
                    required
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <Select
                    label="Language"
                    placeholder="Select language"
                    data={[
                      { value: "javascript", label: "JavaScript" },
                      { value: "python", label: "Python" },
                      { value: "java", label: "Java" },
                      { value: "cpp", label: "C++" },
                    ]}
                    searchable
                    required
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
            <Card style={{ height: cardHeight, overflowY: "auto" }} c={"white"}>
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
