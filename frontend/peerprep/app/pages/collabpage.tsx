import { Grid, Card, Text } from "@mantine/core";
import { COLLABCARDHEIGHT } from "~/constants/constants";
import SessionControlBar from "../components/sessioncontrolbar/SessionControlBar";
import TestCase from "../components/testcases/TestCase";
import { CodeEditor } from "../components/codeeditor/CodeEditor";
import { useEffect, useState } from "react";
import { createSessionId } from "../services/CollabService";
import { CollabProvider } from "context/CollabProvider";

export default function CollabPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [connectedWith, setConnectedWith] = useState<string | null>(null);

  useEffect(() => {
    // Set required parameters
    createSessionId()
      .then((result) => {
        setSessionId(result.sessionId);
        setConnectedWith(result.connectedWith);
      })
      .catch((error) => {
        console.error("Error creating session:", error);
      });
  }, []);

  return (
    <>
      {sessionId && (
        <CollabProvider sessionId={sessionId}>
          <Grid>
            <Grid.Col span={{ base: 12 }}>
              <SessionControlBar user={connectedWith} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card
                style={{ height: COLLABCARDHEIGHT, overflowY: "auto" }}
                c={"white"}
              >
                <Text>Left Side</Text>
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
