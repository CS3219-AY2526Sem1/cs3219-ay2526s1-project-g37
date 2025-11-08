// CollabProvider.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  useImperativeHandle,
} from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { useSearchParams } from "react-router";
import { stringToPaletteColor } from "~/Utils/Utils";

/**
 * Collab context definition
 */
const CollabContext = createContext<{
  provider: WebsocketProvider | null;
  sessionId: string;
  ydoc: Y.Doc | null;
  clearWebsocketSession: () => void;
} | null>(null);

/**
 * Props for CollabProvider component
 */
interface CollabProviderProps {
  sessionId: string;
  children: React.ReactNode;
  collabRef?: React.RefObject<{ destroySession: () => void } | null>;
}

// Inject awareness cursor styles
// Related documentation: https://github.com/yjs/y-monaco/blob/master/demo/index.html, https://github.com/yjs/y-monaco
/**
 * Inject styles for remote user cursors and selections
 * @param clientId - Unique client ID for the remote user
 * @param color - Color associated with the remote user
 */
function injectAwarenessStyles(clientId: number, color: string) {
  const styleId = `y-cursor-style-${clientId}`;
  if (typeof document === "undefined" || document.getElementById(styleId))
    return;

  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    /* Remote Selection Highlight */
    .yRemoteSelection-${clientId} { 
      background-color: ${color};
      opacity: 0.3;
    }

    @keyframes remote-cursor-blink {
      0%, 100% { 
          opacity: 1; 
      }
      50% { 
          opacity: 0; 
      }
    }

    /* Remote Cursor Line */
    .yRemoteSelectionHead-${clientId} { 
      position: absolute;
      height: 100%;

      border-left-style: solid;
      border-left-width: 2px;
      border-color: ${color} !important;

      z-index: 50;
      pointer-events: none;
      box-sizing: border-box;
      animation: remote-cursor-blink 1s step-end infinite;
    }
  `;
  document.head.appendChild(style);
}

/**
 * CollabProvider component to provide Yjs WebSocket collaboration context
 * @param props - Props containing sessionId, children elements, and optional collabRef
 * @returns JSX.Element
 */
export function CollabProvider({
  sessionId,
  children,
  collabRef,
}: CollabProviderProps) {
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
  const [searchParams] = useSearchParams();

  const USER = useRef(
    searchParams.get("user_id") || `User-${Math.floor(Math.random() * 1000)}`
  );
  const USER_COLOR = useRef(stringToPaletteColor(USER.current));

  /**
   * Clear the current WebSocket collaboration session
   * Sets the document to empty and destroys the provider
   */
  const clearWebsocketSession = useCallback(() => {
    console.log("Clearing websocket session...", provider);
    if (provider && ydoc) {
      ydoc.getText("monaco-code").delete(0, ydoc.getText("monaco-code").length);
      ydoc.destroy();
      provider.destroy();

      setProvider(null);
      setYdoc(null);
    }
  }, [provider, ydoc]);

  /**
   * Expose destroySession method via collabRef
   */
  useImperativeHandle(
    collabRef,
    () => ({
      destroySession: clearWebsocketSession,
      ydoc: ydoc,
    }),
    [clearWebsocketSession]
  );

  /**
   * Initialize Yjs document and WebSocket provider on sessionId change
   * @returns Cleanup function to destroy provider and document on unmount
   */
  useEffect(() => {
    const ydocInstance = new Y.Doc();
    setYdoc(ydocInstance);
    const wsProvider = new WebsocketProvider(
      import.meta.env.VITE_YJS_WS_URL,
      sessionId,
      ydocInstance
    );

    wsProvider.awareness.setLocalStateField("user", {
      name: USER.current,
      color: USER_COLOR.current,
    });

    /**
     * Update awareness styles for remote users
     */
    const updateAwareness = () => {
      wsProvider.awareness.getStates().forEach((state, clientId) => {
        if (state.user) {
          injectAwarenessStyles(clientId, state.user.color);
        }
      });
    };

    wsProvider.awareness.on("update", updateAwareness);
    updateAwareness();

    wsProvider.on("status", (event) =>
      console.log("Y-WebSocket status:", event.status)
    );
    wsProvider.on("sync", () => console.log("y-websocket: init sync complete"));

    setProvider(wsProvider);
    console.log("Provider initialized:", wsProvider);

    return () => {
      wsProvider.awareness.off("update", updateAwareness);
      wsProvider.destroy();
      setProvider(null);
      setYdoc(null);
    };
  }, [sessionId, USER, USER_COLOR]);

  return (
    <CollabContext.Provider
      value={{ provider, sessionId, ydoc, clearWebsocketSession }}
    >
      {children}
    </CollabContext.Provider>
  );
}

/**
 * Custom hook to use Collab context
 * @returns Collab context value
 */
export function useCollabProvider() {
  return useContext(CollabContext);
}
