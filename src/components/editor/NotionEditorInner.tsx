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
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import type { BlogPostContent } from "@/types/blocknote";
import type { NotionEditorHandle, NotionEditorProps } from "./notion-editor-types";

function normalizeInitialBlocks(
  raw: BlogPostContent | null | undefined
): PartialBlock[] | undefined {
  if (!raw || !Array.isArray(raw) || raw.length === 0) return undefined;
  return raw as PartialBlock[];
}

/** BlockNote — 공식 useCreateBlockNote + Mantine 뷰 (클라이언트 전용). */
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

  const editor = useCreateBlockNote(
    {
      initialContent: initialBlocks,
      uploadFile: uploadFileRef.current
        ? async (file) => uploadFileRef.current!(file)
        : undefined,
    },
    [storageKey, initialBlocks]
  );

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
      className="[&_.bn-editor]:min-h-[50vh]"
    />
  );
});
