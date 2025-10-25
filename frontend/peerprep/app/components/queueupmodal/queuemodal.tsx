import { useDisclosure } from "@mantine/hooks";
import { Modal, Button } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import FoundModal from "./foundmodal";
import TimeoutModal from "./timeoutmodal";
import SearchingModal from "./searchingmodal";
import SelectionModal from "./selectionmodal";
import { useNavigate } from "react-router";
import { useAuth } from "../../Context/authContext";
import { useMatchingService } from "~/Services/MatchingService";

export default function QueueModal() {
  const [opened, { open, close }] = useDisclosure(false);
  const [queueStatus, setQueueStatus] = useState<
    "idle" | "searching" | "found" | "timeout"
  >("idle");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [redirectCountdown, setRedirectCountdown] = useState(3);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [shouldNavigate, setShouldNavigate] = useState(false);
  const { sendQueueRequest, sendLeaveRequest } = useMatchingService();

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

  const leaveQueue = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      handleLeaveQueue();
      socket.close();
    }
    setQueueStatus("idle");
  };

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

  useEffect(() => {
    if (shouldNavigate) {
      navigate(`/collab/${sessionId}`);
    }
  }, [shouldNavigate]);

  // unload when user closes tab
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
      <Modal opened={opened} onClose={unloadModal} c="white" title={getTitle()}>
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
