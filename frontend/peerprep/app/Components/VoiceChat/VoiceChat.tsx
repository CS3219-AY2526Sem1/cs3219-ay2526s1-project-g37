import { useEffect, useRef, useState } from "react";
import Peer from "peerjs";

export default function VoiceChat({ userId, collaboratorId }: { userId: string; collaboratorId: string }) {
    const [inCall, setInCall] = useState<boolean>(false);
    const [peerId, setPeerId] = useState<string>("");
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [isDeafened, setIsDeafened] = useState<boolean>(false);

    const localAudioRef = useRef<HTMLAudioElement | null>(null);
    const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
    const peerInstance = useRef<Peer | null>(null);

    // Initialize PeerJS
    useEffect(() => {
        const peer = new Peer(userId, {
            host: `${import.meta.env.VITE_PEERJS_HOST}`, // Replace with your PeerJS server's hostname
            port: parseInt(import.meta.env.VITE_PEERJS_PORT) || 9000,                    // Replace with your PeerJS server's port
        });

        peer.on("open", (id) => {
            console.log(`PeerJS: My peer ID is: ${id}`);
            setPeerId(id);
        });

        peer.on("error", (err) => {
            console.error("PeerJS Error:", err);
        });

        // Handle incoming calls
        peer.on("call", (call) => {
            console.log("Receiving a call...");
            navigator.mediaDevices
                .getUserMedia({ audio: true, video: false })
                .then((mediaStream) => {
                    if (localAudioRef.current) {
                        localAudioRef.current.srcObject = mediaStream;
                        localAudioRef.current.play();
                    }

                    call.answer(mediaStream); // Answer the call with the local audio stream

                    call.on("stream", (remoteStream) => {
                        console.log("Received remote stream.");
                        if (remoteAudioRef.current) {
                            remoteAudioRef.current.srcObject = remoteStream;
                            remoteAudioRef.current.play();
                        }
                    });

                    call.on("close", () => {
                        console.log("Call closed.");
                    });
                })
                .catch((err) => {
                    console.error("Failed to get local audio stream:", err);
                });
        });

        peerInstance.current = peer;

        return () => {
            peer.destroy(); // Cleanup on unmount
        };
    }, [userId]);

    // Handle outgoing calls
    const callCollaborator = () => {
        setInCall(true);

        if (!collaboratorId) {
            console.error("Collaborator ID is missing.");
            return;
        }

        navigator.mediaDevices
            .getUserMedia({ audio: true, video: false })
            .then((mediaStream) => {
                if (localAudioRef.current) {
                    localAudioRef.current.srcObject = mediaStream;
                    localAudioRef.current.play();
                }

                const call = peerInstance.current?.call(collaboratorId, mediaStream);

                if (call) {
                    call.on("stream", (remoteStream) => {
                        console.log("Received remote stream.");
                        if (remoteAudioRef.current) {
                            remoteAudioRef.current.srcObject = remoteStream;
                            remoteAudioRef.current.play();
                        }
                    });

                    call.on("close", () => {
                        console.log("Call closed.");
                    });
                }
            })
            .catch((err) => {
                console.error("Failed to get local audio stream:", err);
            });
    };

    const handleEndCall = () => {
        console.log("localAudioRef.current?.srcObject", localAudioRef.current?.srcObject);
        console.log("remoteAudioRef.current?.srcObject", remoteAudioRef.current?.srcObject);

        setInCall(false);
        // Stop local audio
        const localStream = localAudioRef.current?.srcObject as MediaStream;
        localStream?.getTracks().forEach((track) => track.stop());
        if (localAudioRef.current) {
            localAudioRef.current.srcObject = null;
        }
        if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = null;
        }

        peerInstance.current?.destroy();
        peerInstance.current = null;
    };

    const handleMute = (mute: boolean) => {
        setIsMuted(mute);
        const localStream = localAudioRef.current?.srcObject as MediaStream;
        console.log("Toggling mute, isMuted:", isMuted);
        console.log("Local stream tracks:", localStream);
        localStream?.getAudioTracks().forEach((track) => (track.enabled = !mute));
    };

    const handleDeafen = () => {
        setIsDeafened((prev) => !prev);
        if (isDeafened) {
            remoteAudioRef.current?.play();
        } else {
            remoteAudioRef.current?.pause();
        }
    };

    return (
        <div>
            {!inCall ? (
                <button onClick={callCollaborator}>Start Voice Chat</button>
            ) : (
                // button to mute and deafen
                <>
                    {isMuted ? (
                        <button onClick={() => handleMute(false)}>Muted</button>
                    ) : (
                        <button onClick={() => handleMute(true)}>Unmuted</button>
                    )}
                    <button onClick={handleDeafen}>{isDeafened ? "Deafened" : "Undeafened"}</button>
                    <button onClick={handleEndCall}>End Voice Chat</button>
                </>
            )}
            <audio ref={localAudioRef} muted />
            <audio ref={remoteAudioRef} />
        </div>
    );
}
