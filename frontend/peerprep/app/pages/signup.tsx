import {
  Grid,
  TextInput,
  Button,
  PasswordInput,
  Divider,
  Text,
  Image,
  Stack,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { Link, Navigate } from "react-router";
import {
  doCreateUserWithEmailAndPassword,
  doUpdateUserProfile,
} from "../firebase/helper";
import { useAuth } from "../context/authContext";
import logo from "../assets/images/logo.svg";
import { useState } from "react";

export function meta() {
  return [
    { title: "PeerPrep - Signup" },
    { name: "description", content: "Welcome to PeerPrep!" },
  ];
}

export default function Signup() {
  const { userLoggedIn } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<{
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
  }>({
    initialValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },

    validate: {
      email: (value) =>
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)
          ? null
          : "Invalid email",
      password: (value) =>
        value.length < 6 ? "Password must be at least 6 characters" : null,
      confirmPassword: (value, values) =>
        value !== values.password ? "Passwords do not match" : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    if (!isRegistering) {
      setIsRegistering(true);
      try {
        await doCreateUserWithEmailAndPassword(values.email, values.password);
        await doUpdateUserProfile(values.username);
      } catch (error) {
        setIsRegistering(false);
        setError(error instanceof Error ? error.message : String(error));
      }
    }
  };

  return (
    <Stack>
      {userLoggedIn && <Navigate to={"/login"} replace={true} />}
      <Grid>
        <Grid.Col span={12}>
          <Grid justify="center" gutter={"xs"} mt={{ base: 20, md: 200 }}>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Image src={logo} alt="PeerPrep Logo" />
              <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
                <Grid.Col span={12}>
                  <TextInput
                    label="Email"
                    placeholder="Enter your email"
                    type="email"
                    key={form.key("email")}
                    {...form.getInputProps("email")}
                    required
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <TextInput
                    label="Username"
                    placeholder="Enter your Username"
                    type="text"
                    key={form.key("username")}
                    {...form.getInputProps("username")}
                    required
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <PasswordInput
                    label="Password"
                    placeholder="Enter your password"
                    type="password"
                    key={form.key("password")}
                    {...form.getInputProps("password")}
                    required
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <PasswordInput
                    label="Re-type Password"
                    placeholder="Re-enter your password"
                    type="password"
                    key={form.key("confirmPassword")}
                    {...form.getInputProps("confirmPassword")}
                    required
                  />
                </Grid.Col>
                <Grid.Col span={12} mt="md">
                  <Button type="submit" fullWidth autoContrast>
                    Sign Up
                  </Button>
                </Grid.Col>
                {error && (
                  <Text
                    c="red"
                    size="sm"
                    mt="md"
                    style={{ textAlign: "center" }}
                  >
                    {error}
                  </Text>
                )}
              </form>
              <Grid.Col span={12} mt="md">
                <Divider my="xs" />
              </Grid.Col>
              <Grid.Col span={12} mt="md" className="text-center">
                <Text span>Already have an account? </Text>
                <Link to="/login">
                  <Text span td="underline" c="blue" className="cursor-pointer">
                    Log in!
                  </Text>
                </Link>
              </Grid.Col>
            </Grid.Col>
          </Grid>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
