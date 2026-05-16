"use client";

import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import {
  EMPTY_BLOG_DOC,
  isTiptapDocument,
  normalizeBlogContent,
  type BlogPostContent,
} from "@/types/blocknote";
import type { NotionEditorHandle, NotionEditorProps } from "./notion-editor-types";

async function uploadImageFile(
  file: File,
  uploadFile: (file: File) => Promise<string>
): Promise<string> {
  return uploadFile(file);
}

/** Tiptap 블로그 에디터 — 프로덕션 BlockNote renderSpec 이슈 회피 */
export const NotionEditorInner = forwardRef<
  NotionEditorHandle,
  NotionEditorProps
>(function NotionEditorInner(
  {
    storageKey = "default",
    initialContent,
    onChangeDocument,
    uploadFile,
    editable = true,
  },
  ref
) {
  const uploadFileRef = useRef(uploadFile);
  uploadFileRef.current = uploadFile;

  const initialDoc = useMemo(
    () => normalizeBlogContent(initialContent),
    [initialContent]
  );

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          heading: { levels: [1, 2, 3] },
        }),
        Link.configure({
          openOnClick: !editable,
          HTMLAttributes: { class: "text-[#1E4E8C] underline" },
        }),
        Image.configure({ allowBase64: false }),
        Placeholder.configure({
          placeholder: "본문을 입력하세요…",
        }),
      ],
      content: initialDoc,
      editable,
      immediatelyRender: false,
      editorProps: {
        attributes: {
          class:
            "min-h-[50vh] max-w-none px-1 py-2 text-gray-800 focus:outline-none [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:text-xl [&_h3]:font-semibold [&_img]:max-w-full [&_img]:rounded-lg [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-6",
        },
        handleDrop: (view, event) => {
          const file = event.dataTransfer?.files?.[0];
          if (!file?.type.startsWith("image/") || !uploadFileRef.current) {
            return false;
          }
          event.preventDefault();
          void uploadImageFile(file, uploadFileRef.current).then((url) => {
            const { schema } = view.state;
            const coordinates = view.posAtCoords({
              left: event.clientX,
              top: event.clientY,
            });
            if (!coordinates) return;
            const node = schema.nodes.image?.create({ src: url });
            if (!node) return;
            const transaction = view.state.tr.insert(coordinates.pos, node);
            view.dispatch(transaction);
          });
          return true;
        },
        handlePaste: (view, event) => {
          const file = event.clipboardData?.files?.[0];
          if (!file?.type.startsWith("image/") || !uploadFileRef.current) {
            return false;
          }
          event.preventDefault();
          void uploadImageFile(file, uploadFileRef.current).then((url) => {
            view.dispatch(
              view.state.tr.replaceSelectionWith(
                view.state.schema.nodes.image!.create({ src: url })
              )
            );
          });
          return true;
        },
      },
      onUpdate: ({ editor: ed }) => {
        onChangeDocument?.(ed.getJSON() as BlogPostContent);
      },
    },
    [storageKey]
  );

  useEffect(() => {
    if (!editor) return;
    const doc = isTiptapDocument(initialContent)
      ? initialContent
      : EMPTY_BLOG_DOC;
    editor.commands.setContent(doc, { emitUpdate: false });
  }, [editor, storageKey, initialContent]);

  useEffect(() => {
    if (editor) editor.setEditable(editable);
  }, [editor, editable]);

  useImperativeHandle(
    ref,
    () => ({
      getDocument: () =>
        (editor?.getJSON() as BlogPostContent) ?? EMPTY_BLOG_DOC,
    }),
    [editor]
  );

  const insertImage = useCallback(() => {
    if (!editor || !uploadFileRef.current) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      void uploadImageFile(file, uploadFileRef.current!).then((url) => {
        editor.chain().focus().setImage({ src: url }).run();
      });
    };
    input.click();
  }, [editor]);

  if (!editor) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white px-4 py-12 text-center text-sm text-gray-500">
        에디터를 불러오는 중입니다…
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      {editable && uploadFile ? (
        <div className="flex flex-wrap gap-1 border-b border-gray-100 px-2 py-2">
          <ToolbarButton
            label="굵게"
            onClick={() => editor.chain().focus().toggleBold().run()}
          />
          <ToolbarButton
            label="기울임"
            onClick={() => editor.chain().focus().toggleItalic().run()}
          />
          <ToolbarButton
            label="H2"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          />
          <ToolbarButton
            label="목록"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          />
          <ToolbarButton label="이미지" onClick={insertImage} />
        </div>
      ) : null}
      <EditorContent editor={editor} />
    </div>
  );
});

function ToolbarButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
    >
      {label}
    </button>
  );
}
