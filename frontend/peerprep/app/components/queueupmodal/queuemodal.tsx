import { useDisclosure } from "@mantine/hooks";
import { Modal, Button } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import FoundModal from "./foundmodal";
import TimeoutModal from "./timeoutmodal";
import SearchingModal from "./searchingmodal";
import SelectionModal from "./selectionmodal";

export default function QueueModal() {
  const [opened, { open, close }] = useDisclosure(false);
  const [queueStatus, setQueueStatus] = useState<
    "idle" | "searching" | "found" | "timeout"
  >("idle");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [redirectCountdown, setRedirectCountdown] = useState(3);
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(searchParams.get("user") || "user1");

  const form = useForm({
    initialValues: {
      topic: "",
      difficulty: "",
    },
  });

  useEffect(() => {
    const userId = searchParams.get("user");
    if (userId) {
      setUser(userId);
    }
  }, [searchParams]);

  const getRequestBody = () => {
    return JSON.stringify({
      user_id: user,
      difficulty: form.values.difficulty,
      topic: form.values.topic,
      language: 'python',
    });
  };

  const sendQueueRequest = () => {
    fetch("http://localhost:8000/match/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: getRequestBody(),
    })
      .then((data) => console.log("Success:", data))
      .catch((error) => console.error("Error:", error));
  };

  const sendLeaveRequest = () => {
    fetch("http://localhost:8000/match/cancel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: getRequestBody(),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        return response.json();
      })
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

  const handleQueue = (values: typeof form.values) => {
    setQueueStatus("searching");

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.log("User ID from URL:", user);
      const newSocket = new WebSocket(`ws://localhost:8000/match/ws/${user}`);

      setSocket(newSocket);

      newSocket.addEventListener("message", (event) => {
        const data = JSON.parse(event.data);
        console.log("Message from server ", data);
        if (data.event == "match.timeout") {
          setQueueStatus("timeout");
          newSocket.close();
        } else if (data.event == "match.found") {
          setQueueStatus("found");
        } else if (data.event == "match.cancelled") {
          setQueueStatus("idle");
          newSocket.close();
        }
      });

      newSocket.addEventListener("open", () => {
        newSocket.send(JSON.stringify({ type: "join", ...values }));
        sendQueueRequest();
      });
    } else {
      sendQueueRequest();
    }
  };

  const leaveQueue = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      sendLeaveRequest();
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

  // unload when user closes tab
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        sendLeaveRequest();
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

  return (
    <>
      <Modal opened={opened} onClose={close} c="white" title={getTitle()}>
        {queueStatus === "idle" && <SelectionModal form={form} handleQueue={handleQueue} />}
        {queueStatus === "searching" && <SearchingModal elapsedTime={elapsedTime} leaveQueue={leaveQueue} />}
        {queueStatus === "timeout" && <TimeoutModal setQueueStatus={setQueueStatus} />}
        {queueStatus === "found" && <FoundModal redirectCountdown={redirectCountdown} />}
      </Modal>
      <Button fullWidth onClick={open}>
        Queue Up
      </Button>
    </>
  );
}
