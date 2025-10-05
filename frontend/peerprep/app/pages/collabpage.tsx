import { Grid, Card, Text } from "@mantine/core";
import { COLLABCARDHEIGHT } from "~/constants/constants";
import SessionControlBar from "../components/sessioncontrolbar/SessionControlBar";
import TestCase from "../components/testcases/TestCase";
import { CodeEditor } from "../components/codeeditor/CodeEditor";
import { useEffect, useState } from "react";
import { createSessionId } from "../services/CollabService";
import { CollabProvider } from "context/CollabProvider";
import useWebSocket, { ReadyState } from 'react-use-websocket';

// TODO: Remove this hardcoded question and fetch from backend instead
const TEST_QUESTION = {
  title: "Sample Question Title",
  description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce at ultrices orci, quis volutpat dui. Morbi in velit porttitor, dictum augue ac, sodales tellus. Duis fermentum justo at sodales scelerisque. Sed et elit euismod, sodales libero at, porttitor nisl. Aliquam ac sapien id nulla cursus accumsan. Cras sit amet metus ipsum. Pellentesque lacinia hendrerit nulla in tincidunt. Nulla sit amet porttitor mauris, id placerat augue. Praesent scelerisque volutpat tortor a consectetur. Etiam fringilla tellus felis, a mattis risus dapibus id. Nulla eget tellus vitae ante porttitor rutrum. Cras a maximus neque, et tempus nisl. Mauris turpis lacus, congue vitae tempor non, facilisis at lacus.\n
Donec felis eros, mollis in tellus vel, tristique bibendum nisl. Vivamus tellus eros, mollis at arcu non, posuere sollicitudin nisi. Curabitur id nunc mollis est laoreet suscipit in sed risus. Nunc sit amet lacinia velit. Quisque facilisis est sapien, blandit cursus tellus venenatis id. In luctus porttitor odio, vel aliquam erat egestas ut. Nam finibus scelerisque odio non vestibulum. Sed posuere aliquam vestibulum. In fermentum mollis dolor at volutpat. \n
Vivamus efficitur consequat ultricies. Sed neque sem, dictum ac nulla eget, faucibus fermentum leo. Nam sit amet venenatis purus, ut dictum purus. Vivamus ultrices cursus efficitur. Duis eu libero lacus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec efficitur sit amet nibh ut euismod. `
};

export default function CollabPage() {
  // TODO: retrieve details from matching page
  const [sessionId, setSessionId] = useState<string | null>("9a1bcb86-8688-5fe4-b69f-c4c8e8a9dc2b");
  const collaborator_id = import.meta.env.VITE_DUMMY_USER_ID === "user1" ? "user2" : "user1";
  const [connectedWith, setConnectedWith] = useState<string | null>(collaborator_id);

  const WS_URL = `ws://${import.meta.env.VITE_COLLAB_SERVICE_URL}/ws/sessions/${sessionId}?user_id=${import.meta.env.VITE_DUMMY_USER_ID}`;
  const { sendMessage, lastMessage, readyState, getWebSocket } = useWebSocket(WS_URL);

  // TODO: Remove for prod, this is just to simulate creation of session (which should already have been done leading up to this page)
  useEffect(() => {
    // Set required parameters
    createSessionId()
      .then((result) => {
        // setSessionId(result.sessionId);
        // setConnectedWith(result.connectedWith);
      })
      .catch((error) => {
        console.error("Error creating session:", error);
      });
  }, []);

  useEffect(() => {
    console.log("py-collab: websocket state changed:", readyState);
    if (readyState === ReadyState.OPEN) {
      console.log("py-collab: WebSocket connection established.");
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

  const handleEndSession = () => {
    // send end session signal to server
    console.log("End session signal sent.");

    const socket = getWebSocket();
    if (socket){
      socket.close();
    }

    // TODO: redirect to next page
    console.log("Redirecting to next page...");
  }

  return (
    <>
      {sessionId && (
        <CollabProvider sessionId={sessionId}>
          <Grid>
            <Grid.Col span={{ base: 12 }}>
              <SessionControlBar user={connectedWith} onEndSession={handleEndSession} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card
                style={{ height: COLLABCARDHEIGHT, overflowY: "auto" }}
                c={"white"}
              >
                <Text size="xl">{TEST_QUESTION.title}</Text>
                <Text size="sm" style={{ whiteSpace: 'pre-line' }}>{TEST_QUESTION.description}</Text>
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
