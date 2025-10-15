// With reference from official Mantine documentation
// https://ui.mantine.dev/category/headers/

import { Button, Container, Group, Text } from "@mantine/core";
import { useNavigate } from "react-router";
import classes from "./header.module.css";
import logo from "../../assets/images/logo.svg";
import { useAuth } from "../../context/authContext";
import { doSignOut } from "~/firebase/helper";

export default function Header() {
  const navigate = useNavigate();
  const { displayName } = useAuth();

  function handleSignOut() {
    doSignOut();
    navigate("/login");
  }

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
          <Text>{displayName ? <>{displayName}</> : <>Empty Name</>}</Text>
          <Button 
            type="button"
            style={{
              backgroundColor: "pink",
              color: "white",
              margin: "20px",
            }}
            onClick={handleSignOut}
          >
            Sign out
          </Button>
        </Group>
      </Container>
    </header>
  );
}
