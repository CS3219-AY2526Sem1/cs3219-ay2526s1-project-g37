import { useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import { type MediaConnection } from "peerjs";

import unmuteIcon from '../../assets/images/mic-svgrepo-com.svg';
import muteIcon from '../../assets/images/mic-off-svgrepo-com.svg';
import deafenIcon from '../../assets/images/headset-off-svgrepo-com.svg';
import undeafenIcon from '../../assets/images/headset-svgrepo-com.svg';

export default function VoiceChat({ userId, collaboratorId, refreshRefs }: { userId: string; collaboratorId: string, refreshRefs: boolean }) {
    const [inCall, setInCall] = useState<boolean>(false);
    const [peerId, setPeerId] = useState<string>("");
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [isDeafened, setIsDeafened] = useState<boolean>(false);

    const localAudioRef = useRef<HTMLAudioElement | null>(null);
    const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
    const peerInstance = useRef<Peer | null>(null);
    const currentCall = useRef<MediaConnection | null>(null);
    const isReadyForCall = useRef<boolean>(false);

    // Cleanup function for ending calls
    const endCall = () => {
        console.log("Ending call...");
        
        // Stop local media tracks
        const localStream = localAudioRef.current?.srcObject as MediaStream;
        localStream?.getTracks().forEach(track => track.stop());
        
        // Close the current call
        currentCall.current?.close();
        currentCall.current = null;
        
        // Clear audio sources
        if (localAudioRef.current) localAudioRef.current.srcObject = null;
        if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
        
        setInCall(false);
        setIsMuted(false);
        setIsDeafened(false);
        isReadyForCall.current = false; // Reset ready state
    };

    // Initialize PeerJS connection
    const initializePeer = () => {
        // Destroy existing peer if any
        if (peerInstance.current) {
            peerInstance.current.destroy();
            peerInstance.current = null;
        }

        const peer = new Peer(userId, {
            host: `${import.meta.env.VITE_PEERJS_HOST}`,
            port: parseInt(import.meta.env.VITE_PEERJS_PORT) || 9000,
        });

        peer.on("open", (id) => {
            console.log(`PeerJS: My peer ID is: ${id}`);
            setPeerId(id);
        });

        peer.on("error", (err) => {
            console.error("PeerJS Error:", err);
        });

        peer.on("disconnected", () => {
            console.log("Peer disconnected");
        });

        // Handle incoming calls
        peer.on("call", (call) => {
            console.log("Receiving a call...");
            
            // Only accept call if user has clicked "Start Voice Chat"
            if (!isReadyForCall.current) {
                console.log("Not ready for call, rejecting...");
                call.close();
                return;
            }

            setInCall(true);
            currentCall.current = call;

            navigator.mediaDevices
                .getUserMedia({ audio: true, video: false })
                .then((mediaStream) => {
                    if (localAudioRef.current) {
                        localAudioRef.current.srcObject = mediaStream;
                        localAudioRef.current.play();
                    }

                    call.answer(mediaStream);

                    call.on("stream", (remoteStream) => {
                        console.log("Received remote stream.");
                        if (remoteAudioRef.current) {
                            remoteAudioRef.current.srcObject = remoteStream;
                            remoteAudioRef.current.play();
                        }
                    });

                    call.on("close", () => {
                        console.log("Call closed by remote peer.");
                        endCall();
                    });
                })
                .catch((err) => {
                    console.error("Failed to get local audio stream:", err);
                    setInCall(false);
                });
        });

        peerInstance.current = peer;
    };

    // Initialize PeerJS on mount
    useEffect(() => {
        initializePeer();

        // Cleanup on unmount
        return () => {
            endCall();
            if (peerInstance.current) {
                peerInstance.current.destroy();
                peerInstance.current = null;
            }
        };
    }, [userId]);

    // Handle outgoing calls
    const startCall = () => {
        if (!collaboratorId) {
            console.error("Collaborator ID is missing.");
            return;
        }

        // Set ready state when user clicks start
        isReadyForCall.current = true;

        // Ensure peer is connected before making a call
        if (!peerInstance.current || peerInstance.current.disconnected || peerInstance.current.destroyed) {
            console.log("Peer not ready, reinitializing...");
            initializePeer();
            // Wait a bit for peer to connect
            setTimeout(() => startCall(), 1000);
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
                    setInCall(true);
                    currentCall.current = call;

                    call.on("stream", (remoteStream) => {
                        console.log("Received remote stream.");
                        if (remoteAudioRef.current) {
                            remoteAudioRef.current.srcObject = remoteStream;
                            remoteAudioRef.current.play();
                        }
                    });

                    call.on("close", () => {
                        console.log("Call closed by remote peer.");
                        endCall();
                    });
                }
            })
            .catch((err) => {
                console.error("Failed to get local audio stream:", err);
            });
    };
    
    useEffect(() => {
        if (localAudioRef.current) {
            console.log("Local audio ref updated:", localAudioRef.current);
        }
        if (remoteAudioRef.current) {
            console.log("Remote audio ref updated:", remoteAudioRef.current);
        }
    }, [localAudioRef.current, remoteAudioRef.current, refreshRefs]);

    const handleMute = (mute: boolean) => {
        setIsMuted(mute);
        const localStream = localAudioRef.current?.srcObject as MediaStream;
        if (!localStream) {
            console.error("Local audio stream is not available.");
            return;
        }
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
                <button onClick={startCall}>Start Voice Chat</button>
            ) : (
                <>
                    <button onClick={() => handleMute(!isMuted)}>
                        {isMuted 
                            ? <img style={{ height: '24px', width: '24px' }} src={muteIcon} alt="Mute Icon" /> 
                            : <img style={{ height: '24px', width: '24px' }} src={unmuteIcon} alt="Unmute Icon" />}
                    </button>
                    <button onClick={handleDeafen}>
                        {isDeafened 
                            ? <img style={{ height: '24px', width: '24px' }} src={deafenIcon} alt="Deafen Icon" /> 
                            : <img style={{ height: '24px', width: '24px' }} src={undeafenIcon} alt="Undeafen Icon" />}
                    </button>
                    <button onClick={endCall} style={{ marginLeft: '12px' }}>End Call</button>
                </>
            )}
            <audio ref={localAudioRef} muted />
            <audio ref={remoteAudioRef} />
        </div>
    );
}
