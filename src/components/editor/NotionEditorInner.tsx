"use client";

import { forwardRef, useCallback, useImperativeHandle, useMemo } from "react";
import type { PartialBlock } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import { BlockNoteView } from "@blocknote/shadcn";
import { useCreateBlockNote } from "@blocknote/react";
import type { BlogPostContent } from "@/types/blocknote";
import type { NotionEditorHandle, NotionEditorProps } from "./notion-editor-types";

function normalizeInitialBlocks(
  raw: BlogPostContent | null | undefined
): PartialBlock[] | undefined {
  if (!raw || !Array.isArray(raw) || raw.length === 0) return undefined;
  return raw as PartialBlock[];
}

/** BlockNote 훅·뷰 — 브라우저 마운트 후에만 사용 (NotionEditor에서 감쌈). */
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
  const initialBlocks = useMemo(
    () => normalizeInitialBlocks(initialContent ?? undefined),
    [initialContent]
  );

  const editor = useCreateBlockNote(
    {
      initialContent: initialBlocks,
      uploadFile: uploadFile ? async (file) => uploadFile(file) : undefined,
    },
    [storageKey]
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
    const snapshot = JSON.parse(
      JSON.stringify(editor.document)
    ) as BlogPostContent;
    onChangeDocument(snapshot);
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
