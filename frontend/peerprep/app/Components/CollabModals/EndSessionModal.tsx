import { Modal, Button, Text, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import RedirectModal from "./RedirectModal";
import { useNavigate } from "react-router";

/**
 * End Session Modal component
 * @param props - Props containing the onEndSession callback. E.g. { onEndSession: () => void }
 * @returns JSX.Element
 */
export default function EndSessionModal({ onEndSession }: { onEndSession: () => void }) {
  const [opened, { open, close }] = useDisclosure(false);
  const [redirectOpened, { open: redirectOpen }] = useDisclosure(false);
  const navigate = useNavigate();

  /**
   * Handle end session action
   */
  function handleEndSession() {
    onEndSession();
    redirectOpen();
    close();
  }

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
            onClick={handleEndSession}
          >
            End Session
          </Button>
          <Button onClick={close}>
            Cancel
          </Button>
        </Group>
      </Modal>
      <RedirectModal opened={redirectOpened} onRedirect={() => navigate("/user", { replace: true })} />
      <Button color="red" onClick={open}>End Session</Button>
    </>
  );
}

