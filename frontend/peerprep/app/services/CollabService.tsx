export async function createSessionId(): Promise<{sessionId: string, connectedWith: string}> {
  const collabServiceHttp = `http://${import.meta.env.VITE_COLLAB_SERVICE_URL}`;

  // Create new session
  const payload = {
    user_ids: ["user1", "user2"],
  };
    console.log("Response status:", `${collabServiceHttp}/sessions/`);

  const response = await fetch(`${collabServiceHttp}/sessions/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  localStorage.setItem('sessionId', data.session_id);
  return {
    sessionId: data.session_id,
    connectedWith: "user2"
  };
}
