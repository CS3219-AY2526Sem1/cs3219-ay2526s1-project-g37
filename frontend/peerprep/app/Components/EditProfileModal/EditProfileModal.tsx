import { Modal, Button, PasswordInput, TextInput, Box, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import userCircle from "../../assets/images/user-circle-svgrepo-com.svg";
import { doPasswordChange, doUpdateUserProfile } from "../../Firebase/helper";
import { useEffect, useState } from "react";
import { notifications } from "@mantine/notifications";

export default function EditProfileModal(props: { displayName: string | null }) {
    const [opened, { open, close }] = useDisclosure(false);
    const [username, setUsername] = useState(props.displayName || "");

    const form = useForm({
        initialValues: {
            username: username,
            password: "",
            confirmPassword: "",
        },

        validate: {
            username: (value) => (value.length < 3 ? "Username must be at least 3 characters" : null),
            password: (value) =>
                // if password is not empty and does not meet length requirement
                value.length !== 0 && value.length < 6 ? "Password must be at least 6 characters" : null,
            confirmPassword: (value, values) => (value !== values.password ? "Passwords do not match" : null),
        },
    });

    const handleSubmit = async (values: typeof form.values) => {
        try {
            if (values.username !== username) {
                await doUpdateUserProfile(values.username);
                notifications.show({
                    title: "Success",
                    message: "Username updated successfully!",
                    color: "green",
                    withBorder: true,
                });
                setUsername(values.username);
            }
            if (values.password) {
                await doPasswordChange(values.password);
                notifications.show({
                    title: "Success",
                    message: "Password updated successfully!",
                    color: "green",
                    withBorder: true,
                });
            }

            close(); // Close modal on success
            form.reset(); // Reset form
        } catch (error) {
            console.error("Failed to update profile:", error);
            notifications.show({
                title: "Error",
                message: `Failed to update profile: ${error}`,
                color: "red",
                withBorder: true,
            });
        }
    };

    // Update when modal opens to ensure latest value
    useEffect(() => {
        if (opened) {
            form.setFieldValue("username", username);
        }
    }, [opened]);

    return (
        <>
            <Button onClick={open} style={{ backgroundColor: "#444444" }}>
                <img src={userCircle} alt="Profile Pic" width={30} height={30} style={{ marginRight: "0.3rem" }} />
                <Text style={{ color: "white" }}>{username || "Edit Profile"}</Text>
            </Button>

            <Modal opened={opened} onClose={close} centered title="Edit Profile">
                <Box component="form" onSubmit={form.onSubmit(handleSubmit)}>
                    <TextInput label="Username" placeholder="Enter your username" {...form.getInputProps("username")} />
                    <PasswordInput
                        label="Password"
                        placeholder="Enter your password"
                        mt="md"
                        description="Leave empty to keep current password"
                        {...form.getInputProps("password")}
                    />
                    <PasswordInput
                        label="Confirm Password"
                        placeholder="Confirm your password"
                        mt="md"
                        {...form.getInputProps("confirmPassword")}
                    />
                    <Button type="submit" fullWidth mt="md">
                        Update Profile
                    </Button>
                </Box>
            </Modal>
        </>
    );
}
