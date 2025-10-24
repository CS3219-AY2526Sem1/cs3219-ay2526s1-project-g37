import { Grid, Button, TextInput, Card, Select, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import CustomRichTextEditor from "~/components/richtexteditor/CustomRichTextEditor";
import HtmlRender from "~/components/htmlrenderer/HtmlRender";
import { CARDHEIGHT } from "~/constants/constants";
import type { Labels } from "~/services/QuestionService";
import { useNavigate } from "react-router";

type Values = {
  name: string;
  description: string;
  difficulty?: string | null;
  topic?: string | null;
};

interface Props {
  initialValues?: Values;
  labels: Labels;
  onSubmit: (values: Values) => Promise<void> | void;
  submitLabel?: string;
}

export default function QuestionForm({
  initialValues,
  labels,
  onSubmit,
  submitLabel = "Submit",
}: Props) {
  const navigate = useNavigate();
  const form = useForm<Values>({
    initialValues: initialValues ?? {
      name: "",
      description: "",
      difficulty: null,
      topic: null,
    },
  });

  const handleSubmit = async (values: Values) => {
    await onSubmit(values);
    // reset to submitted values only when initialValues was not provided (add form)
    if (!initialValues) form.reset();
  };

  const handleBack = () => {
    navigate("/questions", { replace: true });
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }} style={{ height: "100%" }}>
          <Card style={{ height: CARDHEIGHT, overflowY: "auto" }}>
            <Grid gutter="sm">
              <Grid.Col span={12}>
                <Text onClick={handleBack} className="backText">
                  {"<< Back"}
                </Text>
              </Grid.Col>
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
              <Grid.Col span={12}>
                <Button type="submit" fullWidth>
                  {submitLabel}
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
  );
}
