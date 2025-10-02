import { Grid, TextInput, Button, PasswordInput, Divider, Text, Image } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Link } from "react-router";
import logo from "../assets/images/logo.svg";

export function meta() {
  return [
    { title: "PeerPrep - Signup" },
    { name: "description", content: "Welcome to PeerPrep!" },
  ];
}

export default function Signup() {
  const form = useForm({
    initialValues: {
      email: "",
      username: "",
      password: "",
    },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) =>
        value.length < 6 ? "Password must be at least 6 characters" : null,
    },
  });

  return (
    <Grid>
      <Grid.Col span={12}>
        <Grid justify="center" gutter={"xs"} mt={{ base: 20, md: 200 }}>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Image src={logo} alt="PeerPrep Logo" />
            <form onSubmit={form.onSubmit((values) => console.log(values))}>
              <Grid.Col span={12}>
                <TextInput
                  label="Email"
                  placeholder="Enter your email"
                  type="email"
                  key={form.key("email")}
                  {...form.getInputProps('email')}
                  error={undefined}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <TextInput
                  label="Username"
                  placeholder="Enter your Username"
                  type="text"
                  key={form.key("username")}
                  {...form.getInputProps('username')}
                  error={undefined}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <PasswordInput
                  label="Password"
                  placeholder="Enter your password"
                  type="password"
                  key={form.key("password")}
                  {...form.getInputProps('password')}
                />
              </Grid.Col>
              <Grid.Col span={12} mt="md">
                <Button type="submit" fullWidth autoContrast>
                  Login
                </Button>
              </Grid.Col>
            </form>
            <Grid.Col span={12} mt="md">
              <Divider my="xs" />
            </Grid.Col>
            <Grid.Col span={12} mt="md" className="text-center">
              <Text span>Already have an account? </Text><Link to="/login"><Text span td="underline" c="blue" className="cursor-pointer">Log in!</Text></Link>
            </Grid.Col>
          </Grid.Col>
        </Grid>
      </Grid.Col>
    </Grid>
  );
}
