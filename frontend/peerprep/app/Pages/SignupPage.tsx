import { TextInput, Button, PasswordInput, Divider, Text, Image, Stack, Center, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Link, Navigate } from "react-router";
import { doCreateUserWithEmailAndPassword, doUpdateUserProfile } from "../Firebase/helper";
import { useAuth } from "../Context/AuthContext";
import logo from "../assets/images/logo.svg";
import { useState } from "react";
import { FirebaseError } from "@firebase/app";

export function meta() {
    return [{ title: "PeerPrep - Signup" }, { name: "description", content: "Welcome to PeerPrep!" }];
}

export default function Signup() {
    const { userLoggedIn } = useAuth();
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForm({
        initialValues: {
            email: "",
            username: "",
            password: "",
        },

        validate: {
            email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
            username: (value) => (value.trim().length < 3 ? "Username must be at least 3 characters" : null),
            password: (value) => (value.length < 6 ? "Password must be at least 6 characters" : null),
        },
    });

    const handleSubmit = async (values: typeof form.values) => {
        if (!isRegistering) {
            setIsRegistering(true);
            try {
                await doCreateUserWithEmailAndPassword(values.email, values.password, values.username);
                await doUpdateUserProfile(values.username);
            } catch (error: unknown) {
                setIsRegistering(false);
                if (error instanceof FirebaseError) {
                    if (error.code === "auth/email-already-exists") {
                        setError("Email already exists, Please try logging in.");
                    } else {
                        setError(error.message);
                    }
                } else {
                    setError(String(error));
                }
            }
        }
    };

    return (
        <Center mih={"100vh"}>
            <Stack justify="center" align="stretch" miw={"50%"}>
                {userLoggedIn && <Navigate to={"/"} replace={true} />}
                <Image src={logo} alt="PeerPrep Logo" />
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <TextInput
                        label="Email"
                        placeholder="Enter your email"
                        type="email"
                        key={form.key("email")}
                        {...form.getInputProps("email")}
                    />
                    <TextInput
                        label="Username"
                        placeholder="Enter your Username"
                        type="text"
                        key={form.key("username")}
                        {...form.getInputProps("username")}
                    />
                    <PasswordInput
                        label="Password"
                        placeholder="Enter your password"
                        type="password"
                        key={form.key("password")}
                        {...form.getInputProps("password")}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        autoContrast
                        my="md"
                        disabled={isRegistering}
                        loading={isRegistering}
                    >
                        Sign Up
                    </Button>
                    {error && (
                        <Text color="red" size="sm" mt="md" style={{ textAlign: "center" }}>
                            {error}
                        </Text>
                    )}
                </form>
                <Divider my="xs" />
                <Group justify="center">
                    <Text span>Already have an account? </Text>
                    <Link to="/">
                        <Text span td="underline" c="blue" className="cursor-pointer">
                            Log in!
                        </Text>
                    </Link>
                </Group>
            </Stack>
        </Center>
    );
}
