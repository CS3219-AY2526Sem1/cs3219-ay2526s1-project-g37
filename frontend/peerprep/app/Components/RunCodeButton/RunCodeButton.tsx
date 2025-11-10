import { Button, Textarea, Card, Text, Group, Stack, Alert } from "@mantine/core";
import { IconPlayerPlay, IconAlertCircle } from "@tabler/icons-react";
import { useState } from "react";

/**
 * Code execution result type
 */
export interface CodeExecutionResult {
  status: "success" | "failed";
  stdout: string;
  stderr: string;
  execution_time: number;
  exit_code: number | null;
}

/**
 * Props for RunCodeButton component
 */
type RunCodeButtonProps = {
  language: string;
  getCode: () => string;
  onRunCode: (code: string, stdin: string) => void;
  executionResult: CodeExecutionResult | null;
  isExecuting: boolean;
  disabled?: boolean;
};

/**
 * RunCodeButton component for executing code via WebSocket
 * @param props - RunCodeButtonProps
 * @returns JSX.Element
 */
export function RunCodeButton({ 
  getCode, 
  onRunCode,
  executionResult,
  isExecuting,
  disabled = false 
}: RunCodeButtonProps) {
  const [stdin, setStdin] = useState("");
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle code execution
   */
  const handleRunCode = () => {
    setError(null);

    try {
      const code = getCode();
      
      if (!code || code.trim() === "") {
        setError("No code to execute. Please write some code first.");
        return;
      }

      onRunCode(code, stdin);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to execute code");
    }
  };

  return (
    <Stack gap="md">
      <Group>
        <Button
          leftSection={<IconPlayerPlay size={16} />}
          onClick={handleRunCode}
          loading={isExecuting}
          disabled={disabled}
          color="#FFC01E"
        >
          {isExecuting ? "Running..." : "Run Code"}
        </Button>
      </Group>

      <Textarea
        label="Input (stdin)"
        placeholder="Enter input for your program (optional)"
        value={stdin}
        onChange={(e) => setStdin(e.currentTarget.value)}
        minRows={2}
        maxRows={4}
        disabled={isExecuting}
      />

      {error && (
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
          {error}
        </Alert>
      )}

      {executionResult && (
        <Card withBorder padding="md">
          <Stack gap="sm">
            <Group>
              <Text fw={700} size="sm">
                Status:
              </Text>
              <Text
                size="sm"
                c={executionResult.status === "success" ? "green" : "red"}
                fw={500}
              >
                {executionResult.status === "success" ? "Success" : "Failed"}
              </Text>
              {executionResult.exit_code !== null && executionResult.exit_code !== undefined && (
                <>
                  <Text fw={700} size="sm">
                    Exit Code:
                  </Text>
                  <Text size="sm">{executionResult.exit_code}</Text>
                </>
              )}
              <Text fw={700} size="sm">
                Time:
              </Text>
              <Text size="sm">{executionResult.execution_time.toFixed(3)}s</Text>
            </Group>

            {executionResult.stdout && (
              <div>
                <Text fw={700} size="sm" mb={4}>
                  Output:
                </Text>
                <Card withBorder padding="xs" bg="dark.7">
                  <Text
                    size="sm"
                    style={{
                      fontFamily: "monospace",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {executionResult.stdout}
                  </Text>
                </Card>
              </div>
            )}

            {executionResult.stderr && (
              <div>
                <Text fw={700} size="sm" mb={4} c="red">
                  Errors:
                </Text>
                <Card withBorder padding="xs" bg="dark.7">
                  <Text
                    size="sm"
                    c="red"
                    style={{
                      fontFamily: "monospace",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {executionResult.stderr}
                  </Text>
                </Card>
              </div>
            )}
          </Stack>
        </Card>
      )}
    </Stack>
  );
}
