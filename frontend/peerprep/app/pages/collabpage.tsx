import { Grid, Card, Text } from "@mantine/core";
import { COLLABCARDHEIGHT } from "~/constants/constants";
import SessionControlBar from "../components/sessioncontrolbar/SessionControlBar";
import TestCase from "../components/testcases/TestCase";
import { CodeEditor } from "../components/codeeditor/CodeEditor";
import { useEffect, useRef, useState } from "react";
import { CollabProvider } from "~/context/CollabProvider";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "../context/authContext";
import type { Question } from "~/services/QuestionService";
import HtmlRender from "~/components/htmlrenderer/HtmlRender";
import { useCollabService } from "~/services/CollabService";

export default function CollabPage() {
  // TODO: retrieve details from matching page
  const params = useParams();
  const { sessionId } = params;
  const { getSessionQuestion, getSessionByUser } = useCollabService();
  const [question, setQuestion] = useState<Question | null>(null);
  const collabRef = useRef<{ destroySession: () => void }>(null);
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [checkingSession, setCheckingSession] = useState(true);

  // check user belongs to sessionId
  useEffect(() => {
    getSessionByUser().then((responseData) => {
      if (responseData.session_id !== sessionId) {
        navigate("/user", { replace: true });
      } else {
        setCheckingSession(false);
      }
    });
  }, []);

  const { sendJsonMessage, lastMessage, readyState, getWebSocket } =
    useWebSocket(
      `${import.meta.env.VITE_COLLAB_SERVICE_WS_URL}/ws/sessions/${sessionId}?user_id=${userId}`,
      { shouldReconnect: () => true }
    );

  useEffect(() => {
    console.log("py-collab: websocket state changed:", readyState);
    if (readyState === ReadyState.OPEN) {
      console.log("py-collab: WebSocket connection established.");
      //  Get question details from backend
      fetchQuestionDetails();
    } else if (readyState === ReadyState.CLOSED) {
      console.log("py-collab: WebSocket connection closed.");
    }
  }, [readyState]);

  useEffect(() => {
    if (lastMessage !== null) {
      console.log("py-collab: Received message:", lastMessage.data);
      const jsonData = JSON.parse(lastMessage.data);
      if (jsonData.type === "collaborator_ended") {
        console.log("py-collab: Collaborator ended the session.");
        handleEndSession();
      }
    }
  }, [lastMessage]);

  const fetchQuestionDetails = async () => {
    try {
      const data = await getSessionQuestion(sessionId!);
      setQuestion(data);
      console.log("Fetched question successfully:", data.name);
    } catch (error) {
      console.error("Failed to fetch question:", error);
      // Handle error, maybe set an error state
    }
  };

  const endWebSocket = () => {
    if (readyState === ReadyState.OPEN) {
      sendJsonMessage({ type: "collaborator_ended" });
    }
    const socket = getWebSocket();
    if (socket) {
      socket.close();
    }
  };

  const handleEndSession = () => {
    // send end session signal to server
    console.log("End session signal sent.");

    endWebSocket();

    console.log("Clearing collab session...");
    if (collabRef.current) {
      collabRef.current.destroySession();
    }

    sessionStorage.setItem("sessionEnded", "true");
    navigate("/user", { replace: true });
  };

  if (!sessionId) {
    return <div>Loading session...</div>;
  }

  return (
    <>
      {checkingSession ? (
        <Text ta={"center"}>Verifying session...</Text>
      ) : (
        <CollabProvider sessionId={sessionId} collabRef={collabRef}>
          <Grid>
            <Grid.Col span={{ base: 12 }}>
              <SessionControlBar
                user={userId}
                onEndSession={handleEndSession}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card
                style={{ height: COLLABCARDHEIGHT, overflowY: "auto" }}
                c={"white"}
              >
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
              </Card>
            </Grid.Col>
            <Grid.Col
              span={{ base: 12, md: 6 }}
              style={{ height: COLLABCARDHEIGHT }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: COLLABCARDHEIGHT,
                  gap: "16px",
                }}
              >
                <Card
                  style={{ flexGrow: 1, height: "60%", overflow: "hidden" }}
                  c={"white"}
                >
                  <CodeEditor
                    defaultLanguage="python"
                    theme="vs-dark"
                    width="100%"
                    height="100%"
                  />
                </Card>

                <Card
                  style={{
                    flexGrow: 1,
                    height: "calc(40% - 16px)",
                    overflowY: "auto",
                  }}
                  c={"white"}
                >
                  <TestCase />
                </Card>
              </div>
            </Grid.Col>
          </Grid>
        </CollabProvider>
      )}
    </>
  );
}
