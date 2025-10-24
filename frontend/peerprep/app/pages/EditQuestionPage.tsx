import { useEffect, useState } from "react";
import {
  type Labels,
  type Question,
  useQuestionService,
} from "~/services/QuestionService";
import QuestionForm from "~/components/question/QuestionForm";
import { useNavigate, useParams } from "react-router";
import { Loader } from "@mantine/core";
import { notifications } from "@mantine/notifications";

export default function EditQuestionPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { id } = params;
  const [labels, setLabels] = useState<Labels>({
    topics: [],
    difficulties: [],
  });
  const [initialValues, setInitialValues] = useState<Question | null>(null);
  const { updateQuestion, getLabels, getQuestion } = useQuestionService();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      navigate("/questions", { replace: true });
    } else {
      getQuestion(id).then((data) => {
        setInitialValues(data);
        setLoading(false);
      });
    }
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
    if (id) {
      updateQuestion(payload, id);
      notifications.show({
        title: "Success",
        message: "Question updated successfully!",
        color: "green",
        withBorder: true,
      });
    } else {
      notifications.show({
        title: "Error",
        message: "Failed to update question. Please try again.",
        color: "red",
        withBorder: true,
      });
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {loading ? (
        <Loader />
      ) : (
        <QuestionForm
          initialValues={initialValues ?? undefined}
          labels={labels}
          onSubmit={handleSubmit}
          submitLabel="Submit"
        />
      )}
    </div>
  );
}
