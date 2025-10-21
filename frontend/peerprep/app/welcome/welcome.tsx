import { useEffect } from "react";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router";
import { Center, Loader, Text } from "@mantine/core";

export function Welcome() {
    const { userLoggedIn } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!userLoggedIn) {
            navigate("/login", { replace: true });
        } else {
            navigate("/user", { replace: true });
        }
    }, [userLoggedIn, navigate]);

    return (
        <Center style={{ minHeight: "100vh" }}>
            <Loader />
            <Text ml="md">Loading...</Text>
        </Center>
    );
}
