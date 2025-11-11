import { useEffect, useState } from "react";
import { type Labels, useQuestionService } from "~/Services/QuestionService";
import QuestionForm from "~/Components/QuestionForm/QuestionForm";
import { notifications } from "@mantine/notifications";

export function meta() {
  return [
    { title: "PeerPrep - Add Question" },
    { name: "description", content: "Add a new question to the database." },
  ];
}

/**
 * Add Question Page component
 * @returns JSX.Element
 */
export default function AddQuestionPage() {
  const { addQuestion, getLabels } = useQuestionService();
  const [labels, setLabels] = useState<Labels>({
    topics: [],
    difficulties: [],
  });

  /**
   * Fetch labels on component mount
   */
  useEffect(() => {
    getLabels().then((data) => setLabels(data));
  }, []);

  /**
   * Handle form submission to add a question
   * @param values - Form values containing question details
   */
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
