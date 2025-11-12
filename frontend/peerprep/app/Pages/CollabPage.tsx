import { Grid, Card, Text } from "@mantine/core";
import { CODE_EDITOR_LANGUAGES, COLLABCARDHEIGHT, COLLAB_DURATION_S } from "~/Constants/Constants";
import SessionControlBar from "../Components/SessionControlBar/SessionControlBar";
import { CodeEditor } from "../Components/CodeEditor/CodeEditor";
import { useEffect, useRef, useState } from "react";
import { CollabProvider } from "~/Context/CollabProvider";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "../Context/AuthContext";
import { useQuestionService, type GetQuestion } from "~/Services/QuestionService";
import HtmlRender from "~/Components/HtmlRender/HtmlRender";
import {
  useCollabService,
  type SessionMetadata,
} from "~/Services/CollabService";
import { isLessThanOneMinuteOld } from "~/Utils/Utils";
import * as Y from "yjs";
import { useUserService  } from "~/Services/UserService";
import VoiceChat from "~/Components/VoiceChat/VoiceChat";
import CollabDisconnectModal from "~/Components/CollabDisconnectModal/CollabDisconnectModal";
import RedirectModal from "~/Components/CollabModals/RedirectModal";
import { useDisclosure } from "@mantine/hooks";
import CustomBadge from "~/Components/LanguageBadge/LanguageBadge";
import { RunCodeButton, type CodeExecutionResult } from "~/Components/RunCodeButton/RunCodeButton";
import { encode } from 'js-base64';


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
  const [refreshRefs, setRefreshRefs] = useState<boolean>(false);

  // Get WebSocket readyState from useWebSocket
  const [ isConnected, setIsConnected ] = useState<boolean>(false);
  const [ lastConnectedTime, setLastConnectedTime ] = useState<Date | null>(null);
  const [ isDisconnectModalOpen, setIsDisconnectModalOpen ] = useState(false);

  const [ redirectOpened, { open: redirectOpen } ] = useDisclosure(false);

  // Code execution state
  const [isCodeExecuting, setIsCodeExecuting] = useState(false);
  const [codeExecutionResult, setCodeExecutionResult] = useState<CodeExecutionResult | null>(null);

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
          redirectOpen();
          const isLessThanOneMinute = isLessThanOneMinuteOld(sessionMetadata?.created_at);
          if (isLessThanOneMinute) {
            handleAbandonSession();
            return;
          } else {
            handleEndSession();
            return;
          }
        }
      } else if (jsonData.type === "collaborator_connect") {
        setIsConnected(true);
        setLastConnectedTime(null); // Reset disconnect time
        setIsDisconnectModalOpen(false); // Close modal if reconnected
      } else if (jsonData.type === "collaborator_disconnect") {
        setLastConnectedTime(new Date());
        setIsConnected(false);
      } else if (jsonData.type === "code_running") {
        // Code execution started
        setIsCodeExecuting(true);
        setCodeExecutionResult(null);
      } else if (jsonData.type === "code_result") {
        // Code execution completed
        setIsCodeExecuting(false);
        setCodeExecutionResult({
          status: jsonData.status,
          stdout: jsonData.stdout,
          stderr: jsonData.stderr,
          execution_time: jsonData.execution_time,
          exit_code: jsonData.exit_code,
        });
      } else if (jsonData.type === "collaborator_disconnect" || jsonData.type === "collaborator_connect") {
        onRefreshRefs();
      }
    }
  }, [lastMessage]);

  // Open disconnect modal if COLLAB_DURATION_S seconds have passed
  useEffect(() => {
    if (!isConnected && lastConnectedTime) {
      const remainingTime = Math.max(
        0,
        COLLAB_DURATION_S * 1000 - (Date.now() - lastConnectedTime.getTime())
      );

      const timer = setTimeout(() => {
        setIsDisconnectModalOpen(true);
      }, remainingTime);

      return () => clearTimeout(timer); // Cleanup timer on unmount or reconnect
    }
  }, [isConnected, lastConnectedTime]);

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
   * Send code execution request via WebSocket
   */
  const handleRunCode = (code: string, stdin: string) => {
    if (readyState === ReadyState.OPEN && sessionMetadata) {
      // Base64 encode code and stdin
      const b64Code = encode(code);
      const b64Stdin = encode(stdin);

      sendJsonMessage({
        type: "run_code",
        language:CODE_EDITOR_LANGUAGES[sessionMetadata.language],
        code: b64Code,
        stdin: b64Stdin
      });
    } else {
      console.error("WebSocket is not open or session metadata is missing");
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
  };

  const onRefreshRefs = () => {
    console.log("Refreshing refs from CollabPage...");
    setRefreshRefs((prev) => !prev); // Toggle the state to trigger a refresh
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
        <CollabProvider sessionId={sessionId} collabRef={collabRef} language={sessionMetadata.language}>
          <CollabDisconnectModal
            durationInS={COLLAB_DURATION_S}
            opened={isDisconnectModalOpen}
            onTerminate={handleEndSession}
            onClose={() => setIsDisconnectModalOpen(false)}
          />
          <Grid>
            <Grid.Col span={{ base: 12 }}>
              <SessionControlBar
                user={collaboratorName}
                onEndSession={handleEndSession}
                userId={userId!}
                collaboratorId={sessionMetadata?.collaborator_id!}
                refreshRefs={refreshRefs}
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
                    <>
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", marginBottom: "8px" }}>
                          <CustomBadge 
                            label="Collaborator" 
                            value={isConnected ? "Connected" : "Disconnected"}
                            color={isConnected ? "darkgreen" : "red"}
                            paddingRight="16px"
                          />
                          <CustomBadge 
                            label="Language" 
                            value={sessionMetadata.language}
                          />
                        </div>
                        <CodeEditor
                          language={CODE_EDITOR_LANGUAGES[sessionMetadata.language]}
                          theme="vs-dark"
                          width="100%"
                          height="100%"
                        />
                    </>
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
                  {sessionMetadata && (
                    <RunCodeButton 
                      language={CODE_EDITOR_LANGUAGES[sessionMetadata.language]}
                      getCode={getEditorString}
                      onRunCode={handleRunCode}
                      executionResult={codeExecutionResult}
                      isExecuting={isCodeExecuting}
                      disabled={!isConnected}
                    />
                  )}
                </Card>
              </div>
            </Grid.Col>
          </Grid>
          <RedirectModal opened={redirectOpened} onRedirect={() => navigate("/user", { replace: true })} />
        </CollabProvider>
      )}
    </>
  );
}
