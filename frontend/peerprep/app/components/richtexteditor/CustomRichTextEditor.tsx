// Implement using official Mantine documentation
// https://mantine.dev/x/tiptap/#controlled

import { RichTextEditor, Link } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import { useEffect } from "react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Superscript from "@tiptap/extension-superscript";
import SubScript from "@tiptap/extension-subscript";
import DOMPurify from "dompurify";
import Image from "@tiptap/extension-image";
import FileHandler from "@tiptap/extension-file-handler";
import { uploadImage } from "~/services/QuestionService";
import { useAuth } from "~/context/authContext";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const minheight = 200;
const MAXFILESIZE = 500; // in KB (500 KB)

function createFileHandlerExtension(tokenId: string | null) {
  return FileHandler.configure({
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
    onDrop: (currentEditor, files, pos) => {
      files.forEach((file) => {
        if (file.size / 1024 > MAXFILESIZE) {
          alert(`File size exceeds the limit of ${MAXFILESIZE}KB`);
          return;
        }

        // upload to server
        uploadImage(file, tokenId)
          .then((data) => {
            console.log("Image uploaded successfully:", data);
            currentEditor
              .chain()
              .insertContentAt(pos, {
                type: "image",
                attrs: {
                  src: data.url,
                },
              })
              .focus()
              .run();
          })
          .catch((error) => {
            console.error("Image upload failed:", error);
            alert("Image upload failed. Please try again.");
          });
      });
    },
    onPaste: (currentEditor, files, htmlContent) => {
      files.forEach((file) => {
        if (file.size / 1024 > MAXFILESIZE) {
          alert(`File size exceeds the limit of ${MAXFILESIZE}KB`);
          return;
        }
        if (htmlContent) {
          console.log(htmlContent);
          return false;
        }

        uploadImage(file, tokenId)
          .then((data) => {
            console.log("Image uploaded successfully:", data);
            currentEditor
              .chain()
              .insertContentAt(currentEditor.state.selection.anchor, {
                type: "image",
                attrs: {
                  src: data.url,
                },
              })
              .focus()
              .run();
          })
          .catch((error) => {
            console.error("Image upload failed:", error);
            alert("Image upload failed. Please try again.");
          });
      });
    },
  });
}

export default function CustomRichTextEditor({
  value,
  onChange,
}: RichTextEditorProps) {
  const { tokenId } = useAuth();

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({ link: false }),
      Link,
      Superscript,
      SubScript,
      Highlight,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image,
      createFileHandlerExtension(tokenId), 
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(DOMPurify.sanitize(editor.getHTML()));
    },
  });

  // Clears editor when form is reset
  useEffect(() => {
    if (!editor) return;
    const sanitized = DOMPurify.sanitize(value || "");
    try {
      const current = editor.getHTML();
      if (current !== sanitized) {
        editor.commands.setContent(sanitized);
      }
    } catch (e) {
      console.error("Error setting editor content:", e);
    }
  }, [value, editor]);

  return (
    <RichTextEditor editor={editor} mih={minheight}>
      <RichTextEditor.Toolbar>
        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Bold />
          <RichTextEditor.Italic />
          <RichTextEditor.Underline />
          <RichTextEditor.Strikethrough />
          <RichTextEditor.ClearFormatting />
          <RichTextEditor.Highlight />
          <RichTextEditor.Code />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.H1 />
          <RichTextEditor.H2 />
          <RichTextEditor.H3 />
          <RichTextEditor.H4 />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Blockquote />
          <RichTextEditor.Hr />
          <RichTextEditor.BulletList />
          <RichTextEditor.OrderedList />
          <RichTextEditor.Subscript />
          <RichTextEditor.Superscript />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Link />
          <RichTextEditor.Unlink />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.AlignLeft />
          <RichTextEditor.AlignCenter />
          <RichTextEditor.AlignJustify />
          <RichTextEditor.AlignRight />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Undo />
          <RichTextEditor.Redo />
        </RichTextEditor.ControlsGroup>
      </RichTextEditor.Toolbar>

      <RichTextEditor.Content mih={minheight} />
    </RichTextEditor>
  );
}
