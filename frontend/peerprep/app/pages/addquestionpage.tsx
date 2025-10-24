import { useEffect, useState } from "react";
import { type Labels, useQuestionService } from "~/services/QuestionService";
import QuestionForm from "~/components/question/QuestionForm";
import { notifications } from "@mantine/notifications";

export default function AddQuestionPage() {
  const [labels, setLabels] = useState<Labels>({ topics: [], difficulties: [] });
  const { addQuestion, getLabels } = useQuestionService();
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
        notifications.show({
          title: "Success",
          message: "Question added successfully!",
          color: "green",
          withBorder: true,
        });
      })
      .catch((error) => {
        console.error("Error adding question:", error);
        notifications.show({
          title: "Error",
          message: "Failed to add question. Please try again.",
          color: "red",
          withBorder: true,
        });
      });
  };

  return (
    <>
      <QuestionForm
        labels={labels}
        onSubmit={handleSubmit}
        submitLabel="Submit"
      />
    </>
  );
}
