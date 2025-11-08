import { Modal, Button, Text, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

/**
 * End Session Modal component
 * @param props - Props containing the onEndSession callback. E.g. { onEndSession: () => void }
 * @returns JSX.Element
 */
export default function EndSessionModal({ onEndSession }: { onEndSession: () => void }) {
  const [opened, { open, close }] = useDisclosure(false);

  /**
   * Handle end session action
   */
  function handleEndSession() {
    if (onEndSession) {
      onEndSession();
    }
    close();
  }

  return (
    <>
      <Modal opened={opened} onClose={close} centered title="End Session">
        <Text mt={10}>
          Are you sure you want to end this session? This action cannot be undone.
        </Text>
        <Group justify="flex-end" gap={10} mt={20}>
          <Button
            color="red"
            onClick={handleEndSession}
            c="white"
          >
            End Session
          </Button>
          <Button onClick={close}>
            Cancel
          </Button>
        </Group>
      </Modal>
      <Button color="red" onClick={open} c="white">End Session</Button>
    </>
  );
}

