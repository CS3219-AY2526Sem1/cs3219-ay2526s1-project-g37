// With reference from official Mantine documentation
// https://ui.mantine.dev/category/headers/

import { Burger, Container, Group, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useNavigate } from "react-router";
import classes from "./header.module.css";
import logo from "../../assets/images/logo.svg";

const links = [{ link: "/user", label: "Home" }];

export default function Header() {
  const [opened, { toggle }] = useDisclosure(false);
  const navigate = useNavigate();

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
          <Text>NorbertLoh</Text>
        </Group>
      </Container>
    </header>
  );
}
