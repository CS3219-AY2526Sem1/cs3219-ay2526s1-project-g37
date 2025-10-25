import { Editor, type EditorProps, type OnMount } from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import type { MonacoBinding } from "y-monaco";
import { useCollabProvider } from "../../Context/CollabProvider";

/**
 * Code Editor component for collaborative editing
 * @param props EditorProps passed down to Monaco Editor
 * @returns JSX.Element
 */
export function CodeEditor(props: EditorProps) {
  const [isBindingLoaded, setIsBindingLoaded] = useState(false);
  const monacoBindingRef = useRef<typeof MonacoBinding | null>(null);
  const collabProvider = useCollabProvider();

  // Load MonacoBinding once
  useEffect(() => {
    // Dynamically import y-monaco to avoid SSR issues
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      editorBinding?.destroy();
    };
  }, [editorBinding]);

  /**
   * Handle editor mount
   * @param editor Monaco editor instance
   */
  const handleEditorDidMount: OnMount = (editor) => {
    if (
      !collabProvider ||
      !monacoBindingRef.current ||
      !collabProvider.ydoc ||
      !collabProvider.provider
    )
      return;

    const MonacoBinding = monacoBindingRef.current;

    // Create MonacoBinding for collaborative editing
    const binding = new MonacoBinding(
      collabProvider.ydoc.getText("monaco-code"),
      editor.getModel()!,
      new Set([editor]),
      collabProvider.provider.awareness
    );

    setEditorBinding(binding);
  };

  if (!collabProvider || !isBindingLoaded || !collabProvider.ydoc) {
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
      defaultValue={collabProvider.ydoc.getText("monaco-code").toString()}
      onMount={handleEditorDidMount}
    />
  );
}
