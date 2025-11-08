import { Grid, Modal, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const TIMER_SECS = 3;

export default function RedirectModal(props: { opened: boolean, onRedirect: () => void }) {
    const [redirectCountdown, setRedirectCountdown] = useState(TIMER_SECS);

    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (props.opened) {
            setRedirectCountdown(TIMER_SECS);
            timer = setInterval(() => {
                setRedirectCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    props.onRedirect();
                    // Redirect to user page
                }
                return prev - 1;
                });
            }, 1000);

            return () => {
                clearInterval(timer);
            };
        };
    }, [props.opened, props.onRedirect]);

    return (
    <Modal opened={props.opened} onClose={() => {}} centered>
        <Grid justify="center" align="center">
        <Grid.Col span={12} ta="center">
            <Text size="xl" fw="700" ta="center" c="white">
            Session Ended
            </Text>
        </Grid.Col>
        <Grid.Col span={12}>
            <Text size="xl" fw="700" ta="center" c="white">
            Redirecting in {redirectCountdown} seconds...
            </Text>
        </Grid.Col>
        </Grid>
    </Modal>
  );
}
