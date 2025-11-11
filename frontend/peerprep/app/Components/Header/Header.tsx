// With reference from official Mantine documentation
// https://ui.mantine.dev/category/headers/

import { Button, Container, Group } from "@mantine/core";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import classes from "./Header.module.css";
import logo from "../../assets/images/logo.svg";
import { doSignOut } from "~/Firebase/helper";
import EditProfileModal from "../EditProfileModal/EditProfileModal";
import { useUserService } from "~/Services/UserService";

/**
 * Header component
 * @returns JSX.Element
 */
export default function Header() {
  const navigate = useNavigate();
  const { getCurrentUserDetails } = useUserService();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const userDetails = await getCurrentUserDetails();
        console.log("Fetched user details:", userDetails);
        setUsername(userDetails.username);
      } catch (error) {
        console.error("Error fetching username:", error);
      }
    };
    
    fetchUsername();
  }, []);

  useEffect(() => {
    console.log("Header username updated:", username);
  }, [username]);
  /**
   * Handle sign out action and navigate to login page
   */
  function handleSignOut() {
    doSignOut();
    navigate("/");
  }

  /**
   * Handle logo click event and navigate to home page
   */
  function handleLogoClick() {
    navigate("/");
  }

  return (
    <header className={classes.header}>
      <Container size={"xl"} className={classes.inner}>
        <Group>
          <img
            src={logo}
            alt="PeerPrep Logo"
            className={classes.logo}
            onClick={handleLogoClick}
          />
        </Group>
        <Group gap={5}>
          <EditProfileModal 
            displayName={username} 
          />
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
