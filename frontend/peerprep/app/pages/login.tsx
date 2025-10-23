import { useState } from "react";
import { Stack, TextInput, Button, PasswordInput, Divider, Text, Image, Group, Center } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Link, Navigate } from "react-router";
import { doSignInWithEmailAndPassword, doSignInWithGoogle } from "~/firebase/helper";
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
                setIsSigningIn(false);
                setError(error instanceof Error ? error.message : String(error));
            }
        }
    };

    return (
        <Center mih={"100vh"}>
            <Stack justify="center" align="stretch" miw={"50%"}>
                {userLoggedIn && <Navigate to={"/user"} replace={true} />}
                <Image src={logo} alt="PeerPrep Logo" />
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <TextInput
                        label="Email"
                        placeholder="Enter your email"
                        type="email"
                        key={form.key("email")}
                        {...form.getInputProps("email")}
                    />
                    <PasswordInput
                        label="Password"
                        placeholder="Enter your password"
                        type="password"
                        key={form.key("password")}
                        {...form.getInputProps("password")}
                    />
                    <Button type="submit" fullWidth autoContrast disabled={isSigningIn} loading={isSigningIn} mt="md">
                        Login
                    </Button>
                    {error && (
                        <Text color="red" size="sm" mt="md" style={{ textAlign: "center" }}>
                            {error}
                        </Text>
                    )}
                </form>
                <Divider my="xs" />
                <Group align="center" justify="center">
                    <Text span>Don't have an account? </Text>
                    <Link to="/signup">
                        <Text span td="underline" c="blue" className="cursor-pointer">
                            Sign up!
                        </Text>
                    </Link>
                </Group>
                <Text ta="center"> Or </Text>
                <Button
                    leftSection={<IconBrandGoogle size={14} />}
                    onClick={onGoogleSignIn}
                    loading={isSigningIn}
                    disabled={isSigningIn}
                    className=" m-2"
                >
                    Sign in with Google
                </Button>
                <Center>
                    <Link to="/reset-password">
                        <Text span td="underline" c="blue" className="cursor-pointer">
                            Forgot Password?
                        </Text>
                    </Link>
                </Center>
            </Stack>
        </Center>
    );
}
