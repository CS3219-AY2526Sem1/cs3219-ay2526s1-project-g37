import { Modal, Button, Text, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

export default function EndSessionModal({ onEndSession }: { onEndSession: () => void }) {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Modal opened={opened} onClose={close} centered>
        <Text size="xl" fw={700}>
          End Session
        </Text>
        <Text mt={10}>
          Are you sure you want to end this session? This action cannot be undone.
        </Text>
        <Group justify="flex-end" gap={10} mt={20}>
          <Button
            color="red"
            onClick={() => {
              if (onEndSession) {
                onEndSession();
              }
              close();
            }}
          >
            End Session
          </Button>
          <Button onClick={close}>
            Cancel
          </Button>
        </Group>
      </Modal>
      <Button color="red" onClick={open}>End Session</Button>
    </>
  );
}

