import React from "react";
import { Alert, Button, Center, Stack, TextInput, Text } from "@mantine/core";
import { doPasswordReset } from "~/Firebase/helper";
import { useNavigate, Link } from "react-router";

export function meta() {
    return [
        { title: "PeerPrep - Reset Password" },
        { name: "description", content: "Reset your PeerPrep account password." },
    ];
}


/**
 * ResetPasswordPage component
 * @returns JSX.Element
 */
export default function ResetPasswordPage() {
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
                    <Text size="xl">Reset Your Password</Text>
                    <TextInput
                        label="Email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(event) => setEmail(event.currentTarget.value)}
                        error={error ? error : ""}
                    />
                    <Button onClick={handleResetPassword}>Reset Password</Button>
                    <Center>
                        <Link to="/">
                            <Text span td="underline" c="blue" className="cursor-pointer">
                                Go back to login page
                            </Text>
                        </Link>
                    </Center>
                </Stack>
            )}
        </Center>
    );
}
