import { Modal, Button, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";


export default function EndSessionModal({ onEndSession }: { onEndSession: () => void }) {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
        <Modal opened={opened} onClose={close} centered>

        <Text size="xl" fw="700">
            End Session
        </Text>
        <Text style={{ marginTop: '10px' }}>
            Are you sure you want to end this session? This action cannot be undone.
        </Text>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <Button color="red" onClick={() => {
              if (onEndSession) {
                onEndSession();
              }
              close();
            }}>
            End Session
            </Button>
            <Button onClick={close}>
            Cancel
            </Button>
        </div>
        </Modal>
        <Button color="red" onClick={open}>End Session</Button>
    </>
  );
};

