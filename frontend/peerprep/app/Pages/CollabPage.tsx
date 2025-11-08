import { Grid, Card, Text } from "@mantine/core";
import { CODE_EDITOR_LANGUAGES, COLLABCARDHEIGHT } from "~/Constants/Constants";
import SessionControlBar from "../Components/SessionControlBar/SessionControlBar";
import TestCase from "../Components/TestCase/TestCase";
import { CodeEditor } from "../Components/CodeEditor/CodeEditor";
import { useEffect, useRef, useState } from "react";
import { CollabProvider } from "~/Context/CollabProvider";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "../Context/AuthContext";
import { useQuestionService, type GetQuestion, type Question } from "~/Services/QuestionService";
import HtmlRender from "~/Components/HtmlRender/HtmlRender";
import {
  useCollabService,
  type SessionMetadata,
} from "~/Services/CollabService";
import { useUserService } from "~/Services/UserService";
import { isLessThanOneMinuteOld } from "~/Utils/Utils";
import * as Y from "yjs";

/**
 * Collaboration Page component
 * @returns JSX.Element - Collaboration Page component
 */
export default function CollabPage() {
  const navigate = useNavigate();
  const params = useParams();
  const { sessionId } = params;

  const { getSessionQuestion, getSessionByUser, getSessionMetadata } =
    useCollabService();
  const { getUserDetails } = useUserService();
  const { insertAttempt } = useQuestionService();

  const [question, setQuestion] = useState<GetQuestion | null>(null);
  const collabRef = useRef<{
    destroySession: () => void;
    ydoc: Y.Doc | null;
  }>(null);

  const { userId } = useAuth();
  const [collaboratorName, setCollaboratorName] = useState<string>("");

  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionMetadata, setSessionMetadata] =
    useState<SessionMetadata | null>(null);

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

  // WebSocket setup
  const { sendJsonMessage, lastMessage, readyState, getWebSocket } =
    useWebSocket(
      `${import.meta.env.VITE_COLLAB_SERVICE_WS_URL}/ws/sessions/${sessionId}?user_id=${userId}`,
      { shouldReconnect: () => true }
    );

  // WebSocket event listeners
  useEffect(() => {
    console.log("py-collab: websocket state changed:", readyState);
    if (readyState === ReadyState.OPEN) {
      console.log("py-collab: WebSocket connection established.");
      //  Get question details from backend
      fetchQuestionDetails();
      // Get session metadata
      getSessionMetadata(sessionId!, userId!)
        .then((metadata) => {
          console.log(metadata);
          setSessionMetadata(metadata);
          console.log("Fetched session metadata:", metadata);
        })
        .catch((error) => {
          console.error("Failed to fetch session metadata:", error);
        });
    } else if (readyState === ReadyState.CLOSED) {
      console.log("py-collab: WebSocket connection closed.");
    }
  }, [readyState]);

  useEffect(() => {
    if (sessionMetadata) {
      const { collaborator_id } = sessionMetadata;
      getUserDetails(collaborator_id)
        .then((data) => {
          console.log("Fetched collaborator details:", data);
          setCollaboratorName(data.username);
        })
        .catch((error) => {
          console.error("Failed to fetch collaborator name:", error);
        });
    }
  }, [sessionMetadata]);

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (lastMessage !== null) {
      console.log("py-collab: Received message:", lastMessage.data);
      const jsonData = JSON.parse(lastMessage.data);
      if (jsonData.type === "collaborator_ended") {
        console.log("py-collab: Collaborator ended the session.");
        if (sessionMetadata) {
          const isLessThanOneMinute = isLessThanOneMinuteOld(sessionMetadata?.created_at);
          if (isLessThanOneMinute) {
            handleAbandonSession();
            return;
          } else {
            handleEndSession();
            return;
          }
        }
      }
    }
  }, [lastMessage]);

  // useEffect(() => {
  //    const data = fetch(`${import.meta.env.VITE_AUTH_ROUTER_URL}/users/${}`)
  // })
  /**
   * Fetch question details for the session
   */
  const fetchQuestionDetails = async () => {
    try {
      const data = await getSessionQuestion(sessionId!);
      setQuestion(data);
      console.log("Fetched question successfully:", data);
    } catch (error) {
      console.error("Failed to fetch question:", error);
      // Handle error, maybe set an error state
    }
  };

  /**
   * End the WebSocket connection gracefully
   */
  const endWebSocket = () => {
    if (readyState === ReadyState.OPEN) {
      sendJsonMessage({ type: "collaborator_ended" });
    }
    const socket = getWebSocket();
    if (socket) {
      socket.close();
    }
  };

  const endSessionAndNavigate = () => {
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

  /**
   * Get editor string from CodeEditor synchronously
   */
  const getEditorString = () => {
    console.log(collabRef.current?.ydoc?.getText("monaco-code").toString());
    return collabRef.current?.ydoc?.getText("monaco-code").toString() || "";
  };

  /**
   * Add attempt record before ending session
   */
  const addAttemptRecord = async () => {
    if (!sessionId) return;
    try {
      const string = getEditorString();

      console.log("Ydoc string to be submitted:", string);
      if (question && question.id && sessionMetadata && question.language && string !== undefined && string !== "") {
        await insertAttempt(
          question.id,
          sessionId,
          question.language,
          sessionMetadata.collaborator_id,
          string
        );
        console.log("Attempt record added successfully.");
      } else {
        console.log("Skipping attempt record - missing data or empty string");
      }
    } catch (error) {
      console.error("Failed to add attempt record:", error);
    }
  };

  /**
   * Handle abandoning the collaboration session
   */
  function handleAbandonSession() {
    endSessionAndNavigate();
  }

  /**
   * Handle ending the collaboration session
   */
  async function handleEndSession() {
    console.log("Handling end session...");
    await addAttemptRecord();
    endSessionAndNavigate();
  }

  return (
    <>
      {checkingSession || !sessionMetadata || !sessionId ? (
        <Text ta={"center"}>Verifying session...</Text>
      ) : (
        <CollabProvider sessionId={sessionId} collabRef={collabRef}>
          <button onClick={getEditorString}>test</button>
          <Grid>
            <Grid.Col span={{ base: 12 }}>
              <SessionControlBar
                user={collaboratorName}
                onEndSession={handleEndSession}
                onAbandonSession={handleAbandonSession}
                metadata={sessionMetadata}
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
                  {sessionMetadata && (
                    <CodeEditor
                      language={CODE_EDITOR_LANGUAGES[sessionMetadata.language]}
                      theme="vs-dark"
                      width="100%"
                      height="100%"
                    />
                  )}
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
