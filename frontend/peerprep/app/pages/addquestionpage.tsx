import {
  Grid,
  Button,
  TextInput,
  Card,
  Select,
} from "@mantine/core";

import { useForm } from "@mantine/form";
import CustomRichTextEditor from "../Components/richtexteditor/CustomRichTextEditor";
import { CARDHEIGHT } from "~/Constants/constants";
import { useEffect, useState } from "react";
import { type Labels, useQuestionService } from "~/services/QuestionService";
import HtmlRender from "~/Components/htmlrenderer/HtmlRender";

export default function AddQuestionPage() {
  const [labels, setLabels] = useState<Labels>({ topics: [], difficulties: [] });
  const { addQuestion, getLabels } = useQuestionService();
  
  const form = useForm<{
    name: string;
    description: string;
    difficulty?: string | null;
    topic?: string | null;
  }>({
    initialValues: {
      name: "",
      description: "",
      difficulty: null,
      topic: null,
    },
  });

  useEffect(() => {
    getLabels().then((data) => setLabels(data));
  }, []);

  const handleSubmit = (values: {
    name: string;
    description: string;
    difficulty?: string | null;
    topic?: string | null;
  }) => {
    console.log(values);
    const payload = {
      name: values.name,
      description: values.description,
      difficulty: values.difficulty ?? "",
      topic: values.topic ?? "",
    };

    addQuestion(payload)
      .then((response) => {
        console.log("Question added successfully:", response);
        alert("Question added successfully!");
        form.reset();
      })
      .catch((error) => {
        console.error("Error adding question:", error);
        alert("Failed to add question. Please try again.");
      });
  };

  return (
    <>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }} style={{ height: "100%" }}>
            <Card style={{ height: CARDHEIGHT, overflowY: "auto" }}>
              <Grid gutter="sm">
                <Grid.Col span={12}>
                  <TextInput
                    label="Question Title"
                    placeholder="Enter question title"
                    {...form.getInputProps("name")}
                    required
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <Select
                    label="Topic"
                    placeholder="Select topic"
                    data={labels.topics}
                    searchable
                    required
                    {...form.getInputProps("topic")}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <Select
                    label="Difficulty"
                    placeholder="Select difficulty"
                    data={labels.difficulties}
                    searchable
                    required
                    {...form.getInputProps("difficulty")}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <CustomRichTextEditor
                    value={form.values.description}
                    onChange={(value) => form.setFieldValue("description", value)}
                  />
                </Grid.Col>
                {/* Future implementation */}
                {/* <Grid.Col span={12}>
                  <Textarea
                    label="Test Cases"
                    placeholder="Enter test cases"
                    required
                  />
                </Grid.Col> */}
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
              <HtmlRender 
                name={form.values.name}
                topic={form.values.topic ?? ""}
                difficulty={form.values.difficulty ?? ""}
                description={form.values.description}
              />
            </Card>
          </Grid.Col>
        </Grid>
      </form>
    </>
  );
}
