"use client";

import { BlockNoteView } from "@blocknote/shadcn";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import {
  Component,
  type ErrorInfo,
  type ReactNode,
  forwardRef,
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
        ...(initialBlocks !== undefined
          ? { initialContent: initialBlocks }
          : {}),
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
      [storageKey, initialContent]
    );

    useImperativeHandle(
      ref,
      () => ({
        getDocument: (): BlockNoteContent =>
          (editor?.document as BlockNoteContent | undefined) ??
          EMPTY_BLOCKNOTE_DOC,
      }),
      [editor]
    );

    if (!editor) {
      return <EditorLoadingPlaceholder />;
    }

    return (
      <BlockEditorErrorBoundary>
        <div className="min-h-[50vh] rounded-lg border border-gray-200 bg-white [&_.bn-editor]:min-h-[48vh]">
          <BlockNoteView
            editor={editor}
            editable={editable}
            onChange={() => {
              onChangeDocument?.(editor.document as BlockNoteContent);
            }}
          />
        </div>
      </BlockEditorErrorBoundary>
    );
  }
);

class BlockEditorErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[BlockEditor]", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-900">
          <p className="font-medium">본문 에디터를 불러오지 못했습니다.</p>
          <p className="mt-2 text-red-800">
            페이지를 새로고침해 주세요. 문제가 계속되면 「BlockNote으로 새로
            작성」(편집 화면)을 사용하거나 관리자에게 문의해 주세요.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

function EditorLoadingPlaceholder() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-12 text-center text-sm text-gray-500">
      에디터를 불러오는 중입니다…
    </div>
  );
}
