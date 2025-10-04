import { Editor, type EditorProps } from "@monaco-editor/react";

export default function CodeEditor(props: EditorProps) {
  return <Editor {...props} />;
}
