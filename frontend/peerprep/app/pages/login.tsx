import { useState } from "react";
import { Stack, Grid, TextInput, Button, PasswordInput, Divider, Text, Image } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Link, Navigate } from "react-router";
import { doSignInWithEmailAndPassword, doSignInWithGoogle } from "~/firebase/auth";
import { FirebaseError } from "firebase/app";
import { useAuth } from "../context/authContext";
import { IconBrandGoogle } from "@tabler/icons-react";
import logo from "../assets/images/logo.svg";

const INVALID_CREDENTIALS = "Invalid email/password, Please try again.";

export function meta() {
    return [{ title: "PeerPrep - Login" }, { name: "description", content: "Welcome to PeerPrep!" }];
}

export default function Login() {
    const { userLoggedIn } = useAuth();
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const form = useForm({
        initialValues: {
            email: "",
            password: "",
        },

        validate: {
            email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
            password: (value) => (value.length < 6 ? "Password must be at least 6 characters" : null),
        },
    });

    const handleSubmit = async (values: typeof form.values) => {
        if (!isSigningIn) {
            setIsSigningIn(true);
            try {
                await doSignInWithEmailAndPassword(values.email, values.password);
            } catch (error: unknown) {
                setIsSigningIn(false);
                if (error instanceof FirebaseError) {
                    if (error.code === "auth/invalid-credential") {
                        setError(INVALID_CREDENTIALS);
                    } else {
                        setError(error.message);
                    }
                } else {
                    setError(String(error));
                }
            }
        }
    };

    const onGoogleSignIn = async () => {
        if (!isSigningIn) {
            setIsSigningIn(true);
            try {
                await doSignInWithGoogle();
            } catch (error) {
                setError(error instanceof Error ? error.message : String(error));
            }
        }
    };

    return (
        <Stack>
            {userLoggedIn && <Navigate to={"/"} replace={true} />}
            <Grid>
                <Grid.Col span={12}>
                    <Grid justify="center" gutter={"xs"} mt={{ base: 20, md: 200 }}>
                        <Grid.Col span={{ base: 12, md: 4 }}>
                            <Image src={logo} alt="PeerPrep Logo" />
                            <form onSubmit={form.onSubmit(handleSubmit)}>
                                <Grid.Col span={12}>
                                    <TextInput
                                        label="Email"
                                        placeholder="Enter your email"
                                        type="email"
                                        key={form.key("email")}
                                        {...form.getInputProps("email")}
                                    />
                                </Grid.Col>
                                <Grid.Col span={12}>
                                    <PasswordInput
                                        label="Password"
                                        placeholder="Enter your password"
                                        type="password"
                                        key={form.key("password")}
                                        {...form.getInputProps("password")}
                                    />
                                </Grid.Col>
                                <Grid.Col span={12} mt="md">
                                    <Button type="submit" fullWidth autoContrast>
                                        Login
                                    </Button>
                                </Grid.Col>
                            {
                                error && (
                                    <Text color="red" size="sm" mt="md" style={{ textAlign: "center" }}>
                                        {error}
                                    </Text>
                                )
                            }
                            </form>
                            <Grid.Col span={12} mt="md">
                                <Divider my="xs" />
                            </Grid.Col>
                            <Grid.Col span={12} mt="md" className="text-center">
                                <Text span>Don't have an account? </Text>
                                <Link to="/signup">
                                    <Text span td="underline" c="blue" className="cursor-pointer">
                                        Sign up!
                                    </Text>
                                </Link>
                                <Text span> Or </Text>
                                <Button
                                    leftSection={<IconBrandGoogle size={14} />}
                                    onClick={onGoogleSignIn}
                                    disabled={isSigningIn}
                                    className=" m-2"
                                >
                                    Sign in with Google
                                </Button>
                            </Grid.Col>
                        </Grid.Col>
                    </Grid>
                </Grid.Col>
            </Grid>
        </Stack>
    );
}
