import { Modal, Text, Button, Grid } from "@mantine/core";
import { useEffect, useState } from "react";


export default function CollabDisconnectModal(props: { durationInS: number, opened: boolean, onTerminate?: () => void }) {
    const [opened, setOpened] = useState(props.opened);

    useEffect(() => {
        setOpened(props.opened);
    }, [props.opened]);
    
    return (
        <Modal opened={opened} onClose={() => setOpened(false)} centered>
            <Text size="xl" fw={700} mb={20}>
                Inactive/Disconnected Collaborator
            </Text>
            <Grid justify="center">
                <Grid.Col span={12}>
                    <Text size="lg" c="white">
                        Collaborator has been disconnected for more than <b>{props.durationInS} seconds</b>. Would you like to terminate the current session? 
                    </Text>
                    <br />
                    <Text size="lg" c="white">
                        <b>Note:</b> you can continue to work on the problem and end the session later.
                    </Text>
                </Grid.Col>
                <Grid.Col span={12}>
                    <Button color="red" fullWidth onClick={props.onTerminate}>
                        Terminate Session
                    </Button>
                </Grid.Col>
            </Grid>
        </Modal>
    );
}
