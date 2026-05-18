"use client";

import { BlockNoteView } from "@blocknote/shadcn";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import {
  EMPTY_BLOCKNOTE_DOC,
  getBlockNoteEditorInitial,
  type BlockNoteContent,
} from "@/types/blocknote";
import type { BlockEditorHandle, BlockEditorProps } from "./block-editor-types";

export const BlockEditorInner = forwardRef<BlockEditorHandle, BlockEditorProps>(
  function BlockEditorInner(
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
      () => getBlockNoteEditorInitial(initialContent),
      [initialContent]
    );

    const editor = useCreateBlockNote(
      {
        initialContent: initialBlocks,
        ...(uploadFile
          ? {
              uploadFile: async (file: File) => {
                if (!uploadFileRef.current) {
                  throw new Error("이미지 업로드가 설정되지 않았습니다.");
                }
                return uploadFileRef.current(file);
              },
            }
          : {}),
      },
      [storageKey]
    );

    // storageKey 변경 시에만 문서 리셋 (initialContent에 live state를 넣으면 입력마다 replaceBlocks → 크래시)
    useEffect(() => {
      if (!editor) return;
      const blocks = getBlockNoteEditorInitial(initialContent);
      editor.replaceBlocks(editor.document, blocks);
      // eslint-disable-next-line react-hooks/exhaustive-deps -- initialContent는 마운트/글 전환 시에만 반영
    }, [editor, storageKey]);

    useImperativeHandle(
      ref,
      () => ({
        getDocument: (): BlockNoteContent =>
          editor?.document ?? EMPTY_BLOCKNOTE_DOC,
      }),
      [editor]
    );

    if (!editor) {
      return <EditorLoadingPlaceholder />;
    }

    return (
      <div className="min-h-[50vh] rounded-lg border border-gray-200 bg-white [&_.bn-editor]:min-h-[48vh]">
        <BlockNoteView
          editor={editor}
          editable={editable}
          onChange={() => {
            onChangeDocument?.(editor.document as BlockNoteContent);
          }}
        />
      </div>
    );
  }
);

function EditorLoadingPlaceholder() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-12 text-center text-sm text-gray-500">
      에디터를 불러오는 중입니다…
    </div>
  );
}
