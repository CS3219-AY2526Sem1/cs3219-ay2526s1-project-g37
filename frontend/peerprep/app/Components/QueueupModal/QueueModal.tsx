import { useDisclosure } from "@mantine/hooks";
import { Modal, Button } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import FoundModal from "./FoundModal";
import TimeoutModal from "./TimeoutModal";
import SearchingModal from "./SearchingModal";
import SelectionModal from "./SelectionModal";
import { useNavigate } from "react-router";
import { useAuth } from "../../Context/AuthContext";
import { useMatchingService } from "~/Services/MatchingService";

/** Queue Modal component
 * @returns JSX.Element
 */
export default function QueueModal() {
  const [opened, { open, close }] = useDisclosure(false);
  const navigate = useNavigate();
  const { userId } = useAuth();
  const { sendQueueRequest, sendLeaveRequest } = useMatchingService();

  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [queueStatus, setQueueStatus] = useState<
    "idle" | "searching" | "found" | "timeout"
  >("idle");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [redirectCountdown, setRedirectCountdown] = useState(3);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [shouldNavigate, setShouldNavigate] = useState(false);

  const form = useForm({
    initialValues: {
      topic: "",
      difficulty: "",
      language: "",
    },
    validate: {
      topic: (value) => (value.trim().length > 0 ? null : "Topic is required"),
      difficulty: (value) =>
        value.trim().length > 0 ? null : "Difficulty is required",
      language: (value) =>
        value.trim().length > 0 ? null : "Language is required",
    },
  });

  /**
   * Get the request body for queueing up
   * @returns Request body for queueing up
   */
  const getRequestBody = (): {
    user_id: string;
    difficulty: string;
    topic: string;
    language: string;
  } => {
    return {
      user_id: userId ?? "",
      difficulty: form.values.difficulty,
      topic: form.values.topic,
      language: form.values.language,
    };
  };

  /**
   * Handle leave queue action.
   * Sets the queue status to idle and closes the WebSocket connection.
   */
  const handleLeaveQueue = () => {
    sendLeaveRequest(getRequestBody())
      .then((responseData) => {
        console.log("Cancel Match Success:", responseData);

        const success = responseData.success;

        if (success) {
          setQueueStatus("idle");
          if (socket && socket.readyState === WebSocket.OPEN) {
            socket.close();
          }
        }
      })
      .catch((error) => console.error("Error:", error));
  };

  /**
   * Handle queue action.
   * Initiates the queueing process by establishing a WebSocket connection
   * and sending the queue request to the server.
   */
  const handleQueue = () => {
    setQueueStatus("searching");

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.log("User ID from URL:", userId);
      const newSocket = new WebSocket(
        `${import.meta.env.VITE_MATCHING_SERVICE_WS_URL}/match/ws/${userId}`
      );

      setSocket(newSocket);

      newSocket.addEventListener("message", (event) => {
        const data = JSON.parse(event.data);
        console.log("Message from server ", data.data);

        if (data.event === "match.timeout") {
          setQueueStatus("timeout");
          newSocket.close();
        } else if (data.event === "match.found") {
          setQueueStatus("found");
          setSessionId(data.data.session_id);
        } else if (data.event === "match.cancelled") {
          setQueueStatus("idle");
          newSocket.close();
        }
      });

      newSocket.addEventListener("open", () => {
        newSocket.send(JSON.stringify({ type: "join", ...form.values }));
        sendQueueRequest(getRequestBody());
      });
    } else {
      sendQueueRequest(getRequestBody());
    }
  };

  /**
   * Leave the queue and reset the queue status to idle.
   * Closes the WebSocket connection if it is open.
   */
  const leaveQueue = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      handleLeaveQueue();
      socket.close();
    }
    setQueueStatus("idle");
  };

  /**
   * Effect to handle elapsed time and redirect countdown based on queue status.
   * Sets up intervals to update elapsed time when searching and redirect countdown when a match is found.
   * Cleans up intervals on component unmount or when queue status changes.
   */
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (queueStatus === "searching") {
      timer = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else if (queueStatus === "found") {
      setRedirectCountdown(3);
      timer = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            if (socket && socket.readyState === WebSocket.OPEN) {
              socket.close();
            }

            // Redirect to the match page
            setShouldNavigate(true);
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setElapsedTime(0);
    }

    return () => {
      clearInterval(timer);
    };
  }, [queueStatus]);

  /**
   * Effect to navigate to the collaboration session when a match is found.
   * Triggers navigation to the collaboration page with the session ID.
   */
  useEffect(() => {
    if (shouldNavigate) {
      navigate(`/collab/${sessionId}`);
    }
  }, [shouldNavigate]);

  /**
   * Effect to handle WebSocket connection cleanup on component unmount.
   * Closes the WebSocket connection if it is open.
   * Useful when user refreshes or closes the browser tab.
   */
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        handleLeaveQueue();
        socket.close();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [queueStatus]);

  /**
   * Get the title for the modal based on the current queue status.
   * @returns Title string for the modal
   */
  const getTitle = () => {
    if (queueStatus === "idle") {
      return "Select Topic and Difficulty";
    } else if (queueStatus === "searching") {
      return "Searching for a match...";
    } else if (queueStatus === "timeout") {
      return "No match found";
    } else if (queueStatus === "found") {
      return "Match found!";
    }
  };

  /**
   * Unload the modal and reset the state.
   * Closes the WebSocket connection if it is open and resets the form and queue status.
   */
  const unloadModal = () => {
    close();
    if (socket && socket.readyState === WebSocket.OPEN) {
      handleLeaveQueue();
      socket.close();
    }
    form.reset();
    setQueueStatus("idle");
  };

  return (
    <>
      <Modal opened={opened} onClose={() => {queueStatus != "found" && unloadModal()}} c="white" title={getTitle()}>
        {queueStatus === "idle" && (
          <SelectionModal form={form} handleQueue={handleQueue} />
        )}
        {queueStatus === "searching" && (
          <SearchingModal elapsedTime={elapsedTime} leaveQueue={leaveQueue} />
        )}
        {queueStatus === "timeout" && (
          <TimeoutModal handleQueue={handleQueue} />
        )}
        {queueStatus === "found" && (
          <FoundModal redirectCountdown={redirectCountdown} />
        )}
      </Modal>
      <Button fullWidth onClick={open}>
        Queue Up
      </Button>
    </>
  );
}
