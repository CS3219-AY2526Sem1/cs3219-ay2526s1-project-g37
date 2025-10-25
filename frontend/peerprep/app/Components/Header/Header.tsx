// With reference from official Mantine documentation
// https://ui.mantine.dev/category/headers/

import { Button, Container, Group, Text } from "@mantine/core";
import { useNavigate } from "react-router";
import classes from "./Header.module.css";
import logo from "../../assets/images/logo.svg";
import { useAuth } from "../../Context/AuthContext";
import { doSignOut } from "~/Firebase/helper";

/**
 * Header component
 * @returns JSX.Element
 */
export default function Header() {
  const navigate = useNavigate();
  const { displayName } = useAuth();

  /**
   * Handle sign out action and navigate to login page
   */
  function handleSignOut() {
    doSignOut();
    navigate("/login");
  }

  /**
   * Handle logo click event and navigate to home page
   */
  function handleLogoClick() {
    navigate("/");
  }

  return (
    <header className={classes.header}>
      <Container size={"md"} className={classes.inner}>
        <Group>
          <img
            src={logo}
            alt="PeerPrep Logo"
            className={classes.logo}
            onClick={handleLogoClick}
          />
        </Group>
        <Group gap={5}>
          <Text>{displayName || "Empty Name"}</Text>
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
