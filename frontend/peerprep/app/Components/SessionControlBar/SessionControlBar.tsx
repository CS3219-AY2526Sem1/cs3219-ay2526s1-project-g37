import { Text } from "@mantine/core";
import { useCollabProvider } from "~/Context/CollabProvider";
import EndSessionModal from "../CollabModals/EndSessionModal";
import type { SessionMetadata } from "~/Services/CollabService";
import AbandonSessionModal from "../CollabModals/AbandonSessionModal";
import { useEffect, useState } from "react";
import { isLessThanOneMinuteOld } from "~/Utils/Utils";

/**
 * Session Control Bar component
 * @param props - Props containing user and optional onEndSession callback
 * @returns JSX.Element
 */
export default function SessionControlBar(props: {
  user: string | null;
  onEndSession?: () => void;
  metadata: SessionMetadata;
  onAbandonSession?: () => void;
}) {
  const { user, onEndSession, metadata, onAbandonSession } = props;
  const collabProvider = useCollabProvider();

  /**
   * Handle ending the session
   */
  const handleEndSession = () => {
    if (onEndSession) {
      onEndSession();
    }
        if (collabProvider) {
      collabProvider.clearWebsocketSession();
    }
  };

  /**
   * Handle abandoning the session
   */
  const handleAbandonSession = () => {
    if (onAbandonSession) {
      onAbandonSession();
    }
        if (collabProvider) {
      collabProvider.clearWebsocketSession();
    }
  };

  // add `import { useEffect, useState } from 'react'` at the top of the file
  const [isCreatedWithinOneMinute, setIsCreatedWithinOneMinute] = useState(
    isLessThanOneMinuteOld(metadata?.created_at)
  );

  useEffect(() => {
    // run immediately and then every second so the value updates as time passes
    setIsCreatedWithinOneMinute(isLessThanOneMinuteOld(metadata?.created_at));
    const id = setInterval(
      () =>
        setIsCreatedWithinOneMinute(
          isLessThanOneMinuteOld(metadata?.created_at)
        ),
      1000
    );
    return () => clearInterval(id);
  }, [metadata?.created_at]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        justifyContent: "center",
      }}
    >
      <Text fw={700}>
        Connected With:{" "}
        <span style={{ color: "var(--mantine-color-green-5)" }}>{user}</span>
      </Text>
      {isCreatedWithinOneMinute ? (
        <AbandonSessionModal onAbandonSession={handleAbandonSession} />
      ) : (
        <EndSessionModal onEndSession={handleEndSession} />
      )}
    </div>
  );
}
