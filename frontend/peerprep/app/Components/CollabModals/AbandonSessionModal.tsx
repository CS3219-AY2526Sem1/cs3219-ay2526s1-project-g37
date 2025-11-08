import { Modal, Button, Text, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

/**
 * End Session Modal component
 * @param props - Props containing the onEndSession callback. E.g. { onEndSession: () => void }
 * @returns JSX.Element
 */
export default function EndSessionModal({ onAbandonSession }: { onAbandonSession: () => void }) {
  const [opened, { open, close }] = useDisclosure(false);

  /**
   * Handle end session action
   */
  function handleEndSession() {
    if (onAbandonSession) {
      onAbandonSession();
    }
    close();
  }

  return (
    <>
      <Modal opened={opened} onClose={close} centered title="Abandon Session">
        <Text mt={10}>
          This session has been less than 1 minute old. Are you sure you want to end this session? Session will not be saved.
        </Text>
        <Group justify="flex-end" gap={10} mt={20}>
          <Button
            color="red"
            onClick={handleEndSession}
            c="white"
          >
            Abandon Session
          </Button>
          <Button onClick={close}>
            Cancel
          </Button>
        </Group>
      </Modal>
      <Button color="red" onClick={open} c="white">Abandon Session</Button>
    </>
  );
}

