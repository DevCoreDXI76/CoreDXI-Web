"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { BlockNoteEditor, type PartialBlock } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
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

/** BlockNote — 클라이언트에서만 인스턴스 생성 후 Mantine 뷰 마운트. */
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
  const [editor, setEditor] = useState<BlockNoteEditor | null>(null);
  const uploadFileRef = useRef(uploadFile);
  uploadFileRef.current = uploadFile;

  const initialBlocks = useMemo(
    () => normalizeInitialBlocks(initialContent ?? undefined),
    [initialContent]
  );

  useEffect(() => {
    let cancelled = false;
    let instance: BlockNoteEditor | null = null;

    const init = () => {
      instance = BlockNoteEditor.create({
        initialContent: initialBlocks,
        uploadFile: uploadFileRef.current
          ? async (file) => uploadFileRef.current!(file)
          : undefined,
      });
      if (!cancelled) setEditor(instance);
    };

    const frame = requestAnimationFrame(init);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      instance?.unmount();
      setEditor(null);
    };
  }, [storageKey, initialBlocks]);

  useImperativeHandle(
    ref,
    () => ({
      getDocument: () =>
        editor
          ? (JSON.parse(JSON.stringify(editor.document)) as BlogPostContent)
          : [],
    }),
    [editor]
  );

  const handleChange = useCallback(() => {
    if (!editor || !onChangeDocument) return;
    onChangeDocument(
      JSON.parse(JSON.stringify(editor.document)) as BlogPostContent
    );
  }, [editor, onChangeDocument]);

  if (!editor) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white px-4 py-12 text-center text-sm text-gray-500">
        에디터를 불러오는 중입니다…
      </div>
    );
  }

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
