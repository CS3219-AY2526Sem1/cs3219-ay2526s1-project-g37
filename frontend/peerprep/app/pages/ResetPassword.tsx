import React from "react";
import { Alert, Button, Center, Stack, TextInput } from "@mantine/core";
import { doPasswordReset } from "~/firebase/helper";
import { useNavigate } from "react-router";

export default function ResetPassword() {
    const [email, setEmail] = React.useState("");
    const [passwordReset, setPasswordReset] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const navigate = useNavigate();

    const handleResetPassword = async () => {
        try {
            await doPasswordReset(email);
            setPasswordReset(true);
            setTimeout(() => {
                navigate(-1);
            }, 5000);
        } catch (error) {
            setError("Failed to send password reset email. Please try again.");
            console.error("Error resetting password:", error);
        }
    };
    return (
        <Center mih={"100vh"}>
            {passwordReset ? (
                <Alert variant="filled" color="rgba(69, 69, 69, 1)" title="Password Reset Email Sent">
                    Please check your email for a link to reset your password.
                </Alert>
            ) : (
                <Stack gap="md" miw={"30%"}>
                    <TextInput
                        label="Email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(event) => setEmail(event.currentTarget.value)}
                        error={error ? error : ""}
                    />
                    <Button onClick={handleResetPassword}>Reset Password</Button>
                </Stack>
            )}
        </Center>
    );
}
