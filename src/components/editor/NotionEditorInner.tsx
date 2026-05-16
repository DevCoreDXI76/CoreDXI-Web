"use client";

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import type { PartialBlock } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/shadcn/style.css";
import type { BlogPostContent } from "@/types/blocknote";
import type { NotionEditorHandle, NotionEditorProps } from "./notion-editor-types";

function normalizeInitialBlocks(
  raw: BlogPostContent | null | undefined
): PartialBlock[] | undefined {
  if (!raw || !Array.isArray(raw) || raw.length === 0) return undefined;
  return raw as PartialBlock[];
}

/** BlockNote — shadcn UI + useCreateBlockNote (클라이언트 전용). */
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

  const initialBlocks = useMemo(
    () => normalizeInitialBlocks(initialContent ?? undefined),
    [initialContent]
  );

  const editorOptions = useMemo(
    () => ({
      ...(initialBlocks ? { initialContent: initialBlocks } : {}),
      uploadFile: uploadFileRef.current
        ? async (file: File) => uploadFileRef.current!(file)
        : undefined,
    }),
    [initialBlocks]
  );

  const editor = useCreateBlockNote(editorOptions, [storageKey, initialBlocks]);

  useImperativeHandle(
    ref,
    () => ({
      getDocument: () =>
        JSON.parse(JSON.stringify(editor.document)) as BlogPostContent,
    }),
    [editor]
  );

  const handleChange = useCallback(() => {
    if (!onChangeDocument) return;
    onChangeDocument(
      JSON.parse(JSON.stringify(editor.document)) as BlogPostContent
    );
  }, [editor, onChangeDocument]);

  return (
    <BlockNoteView
      editor={editor}
      theme="light"
      editable={editable}
      onChange={handleChange}
      className="bn-shadcn [&_.bn-editor]:min-h-[50vh]"
    />
  );
});
