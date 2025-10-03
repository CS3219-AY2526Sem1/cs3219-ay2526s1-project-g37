import { Card, Text, TextInput } from "@mantine/core";
import TestCaseBar from "./TestCaseBar";

export default function TestCase() {
  return (
    <>
      <TestCaseBar />
      <Card
        style={{
          height: "100%",
          backgroundColor: "var(--mantine-color-dark-7)",
          overflowY: "auto",
        }}
        c={"white"}
      >
        <TextInput label="Input" mb="md" />
        <TextInput label="Stdout" mb="md" />
        <TextInput label="Output" mb="md" />
      </Card>
    </>
  );
}
