import { Text } from "@mantine/core";
import { useCollabProvider } from "~/Context/CollabProvider";
import EndSessionModal from "../CollabModals/EndSessionModal";
import VoiceChat from "../VoiceChat/VoiceChat";

/**
 * Session Control Bar component
 * @param props - Props containing user and optional onEndSession callback
 * @returns JSX.Element
 */
export default function SessionControlBar(props: { user: string | null; onEndSession?: () => void; userId: string; collaboratorId: string; refreshRefs: boolean }) {
    const { user, onEndSession } = props;
    const collabProvider = useCollabProvider();

    /**
     * Handle ending the session
     */
    const handleEndSession = () => {
      if (collabProvider) {
        collabProvider.clearWebsocketSession();
      }
      if (onEndSession) {
        onEndSession();
      }
    };

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between", // Space between for left, center, and right alignment
                padding: "0 16px", // Add padding for spacing
                width: "100%", // Ensure it spans the full width of the page
            }}
        >
            {/* Centered Content */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", margin: "0 auto" }}>
                <Text fw={700}>
                    Connected With:{" "}
                    <span style={{ color: "var(--mantine-color-green-5)" }}>{user}</span>
                </Text>
                <EndSessionModal onEndSession={handleEndSession} />
            </div>

            {/* Right-Aligned VoiceChat */}
            <div style={{ marginLeft: "10px" }}>
                <VoiceChat userId={props.userId} collaboratorId={props.collaboratorId} refreshRefs={props.refreshRefs} />
            </div>
        </div>
    );
}
