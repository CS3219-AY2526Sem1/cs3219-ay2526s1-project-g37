import { Grid, Card, Text } from "@mantine/core";
import { COLLABCARDHEIGHT } from "~/constants/constants";
import SessionControlBar from "../components/sessioncontrolbar/SessionControlBar";
import TestCase from "../components/testcases/TestCase";
import CodeEditor from "../components/codeeditor/CodeEditor";

export default function CollabPage() {
  return (
    <>
      <Grid>
        <Grid.Col span={{ base: 12 }} align="center">
          <SessionControlBar />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card style={{ height: COLLABCARDHEIGHT, overflowY: "auto" }} c={"white"}>
            <Text>Left Side</Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }} style={{ height: COLLABCARDHEIGHT }}>
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
    </>
  );
}
