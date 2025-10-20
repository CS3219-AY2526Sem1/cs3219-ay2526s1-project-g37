// With reference from official Mantine documentation
// https://ui.mantine.dev/category/headers/

import { Container, Group, Text } from "@mantine/core";
import { useNavigate } from "react-router";
import classes from "./header.module.css";
import logo from "../../assets/images/logo.svg";
import { useAuth } from "../../context/authContext";

export default function Header() {
  const navigate = useNavigate();
  const { displayName } = useAuth();

  return (
    <header className={classes.header}>
      <Container size={"md"} className={classes.inner}>
        <Group>
          <img
            src={logo}
            alt="PeerPrep Logo"
            className={classes.logo}
            onClick={() => navigate("/")}
          />
        </Group>
        <Group gap={5}>
          <Text>{displayName}</Text>
        </Group>
      </Container>
    </header>
  );
}
