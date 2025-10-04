import { Editor, type EditorProps, type OnMount } from "@monaco-editor/react";
import * as Y from "yjs";
import { useEffect, useRef, useState } from "react";
import type { MonacoBinding } from "y-monaco";
import type { WebsocketProvider } from "y-websocket";
import { stringToPaletteColor } from "../../utils/utils";
import { useSearchParams } from "react-router";

// Inject awareness cursor styles
// Related documentation: https://github.com/yjs/y-monaco/blob/master/demo/index.html, https://github.com/yjs/y-monaco
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

interface YjsState {
  ydoc: Y.Doc;
  yText: Y.Text;
  provider: WebsocketProvider;
}

export function CodeEditor(props: EditorProps & { sessionId: string }) {
  const [yjsState, setYjsState] = useState<YjsState | null>(null);
  const [isBindingLoaded, setIsBindingLoaded] = useState(false);
  const monacoBindingRef = useRef<typeof MonacoBinding | null>(null);
  const [searchParams] = useSearchParams();

  // useRef to persist user ID and color across renders
  const USER = useRef(
    searchParams.get("user_id") || `User-${Math.floor(Math.random() * 1000)}`
  );
  const USER_COLOR = useRef(stringToPaletteColor(USER.current));
  const WS_URL = import.meta.env.VITE_YJS_WS_URL;

  // Initialize Yjs + WebSocket provider once
  useEffect(() => {
    let provider: WebsocketProvider | null = null;

    const init = async () => {
      const ydoc = new Y.Doc();
      const yText = ydoc.getText("monaco-code");

      const { WebsocketProvider } = await import("y-websocket");
      provider = new WebsocketProvider(WS_URL, props.sessionId, ydoc);

      provider.awareness.setLocalStateField("user", {
        name: USER.current,
        color: USER_COLOR.current,
      });

      const updateAwareness = () => {
        provider!.awareness.getStates().forEach((state, clientId) => {
          if (state.user)
            injectAwarenessStyles(clientId, state.user.color, state.user.name);
        });
      };

      provider.awareness.on("update", updateAwareness);
      updateAwareness();

      provider.on("status", (event) =>
        console.log("Y-WebSocket status:", event.status)
      );
      provider.on("sync", () => console.log("Initial sync complete"));

      setYjsState({ ydoc, yText, provider });
    };

    init();

    return () => {
      provider?.destroy();
    };
  }, []);

  // Load MonacoBinding once
  useEffect(() => {
    import("y-monaco")
      .then((module) => {
        monacoBindingRef.current = module.MonacoBinding;
        setIsBindingLoaded(true);
      })
      .catch(console.error);
  }, []);

  const [editorBinding, setEditorBinding] = useState<MonacoBinding | null>(
    null
  );

  // Clean up editor binding
  useEffect(() => {
    return () => {
      editorBinding?.destroy();
    };
  }, [editorBinding]);

  const handleEditorDidMount: OnMount = (editor) => {
    if (!yjsState || !monacoBindingRef.current) return;

    const binding = new monacoBindingRef.current(
      yjsState.yText,
      editor.getModel()!,
      new Set([editor]),
      yjsState.provider.awareness
    );

    setEditorBinding(binding);
  };

  if (!yjsState || !isBindingLoaded) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="text-center text-gray-500">
          Initialising collaborative session...
        </div>
      </div>
    );
  }

  return (
    <Editor
      {...props}
      defaultValue={yjsState.yText.toString()}
      onMount={handleEditorDidMount}
    />
  );
}
