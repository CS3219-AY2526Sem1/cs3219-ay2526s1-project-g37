import { useEffect, useState } from "react";
import { type Question, useQuestionService } from "~/Services/QuestionService";
import { useNavigate, useParams } from "react-router";
import { Card, Grid, Loader, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import type { InterviewHistory } from "~/Components/Tables/HistoryTable";
import { CARDHEIGHT } from "~/Constants/Constants";
import HtmlRender from "~/Components/HtmlRender/HtmlRender";
import { Editor } from "@monaco-editor/react";
import CustomBadge from "~/Components/LanguageBadge/LanguageBadge";
import { CODE_EDITOR_LANGUAGES } from "~/Constants/Constants";

export default function ViewSubmissionPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { getAttempt, getQuestion } = useQuestionService();
  const { id } = params;
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState<InterviewHistory | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);

  useEffect(() => {
    if (!id) {
      navigate("/user", { replace: true });
    } else {
      getAttempt(id)
        .then((data) => {
          console.log(data);
          setSubmission(data);
          getQuestion(data.question_id).then((questionData) => {
            setQuestion(questionData);
          });
          setLoading(false);
        })
        .catch(() => {
          notifications.show({
            title: "Error",
            message: "Failed to load submission. Please try again.",
            color: "red",
            withBorder: true,
          });
        });
    }
  }, []);

  const handleBack = () => {
    navigate("/user", { replace: true });
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <Grid gutter="md" justify="center" align="flex-start">
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Card style={{ height: CARDHEIGHT, overflowY: "auto" }} c={"white"}>
              <Grid gutter="sm">
                <Grid.Col span={12}>
                  <a onClick={handleBack} className="backText">
                    <Text>{"<< Back"}</Text>
                  </a>
                </Grid.Col>
                <Grid.Col span={12}>
                  {question ? (
                    <HtmlRender
                      name={question.name}
                      topic={question.topic}
                      difficulty={question.difficulty}
                      description={question.description}
                    />
                  ) : (
                    <Text>Loading...</Text>
                  )}
                </Grid.Col>
              </Grid>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 5 }} style={{ height: CARDHEIGHT }}>
            <Card style={{ height: CARDHEIGHT, overflowY: "auto" }} c={"white"}>
              {submission ? (
                <Grid gutter="sm">
                  <Grid.Col span={12}>
                    <Text fw={700} size="xl">
                      Submitted Solution
                    </Text>
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <CustomBadge
                      label="Language"
                      value={submission.language}
                    />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <div
                      style={{
                        height: "calc(100vh - 220px)",
                        minHeight: "500px",
                      }}
                    >
                      <Editor
                        language={CODE_EDITOR_LANGUAGES[submission.language]}
                        theme="vs-dark"
                        width="100%"
                        height="100%"
                        value={submission.submitted_solution}
                        options={{
                          readOnly: true,
                          domReadOnly: true,
                        }}
                      />
                    </div>
                  </Grid.Col>
                </Grid>
              ) : (
                <Text>Loading...</Text>
              )}
            </Card>
          </Grid.Col>
        </Grid>
      )}
    </>
  );
}
