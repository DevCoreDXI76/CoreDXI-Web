/**
 * [홍보팀] 노션형 블로그 에디터 (BlockNote + shadcn)
 *
 * - `/` 슬래시 메뉴로 단락·제목·체크리스트·이미지·동영상 블록 등을 추가할 수 있습니다.
 * - 이미지는 블록에 삽입·드래그앤드롭·붙여넣기 시 서버 업로드(Supabase `blog-images`)로 연동됩니다.
 * - 관리자 화면: 편집 가능. 공개 글 `/blog/[slug]`에서는 읽기 전용(`editable={false}`)으로 같은 JSON을 렌더링합니다.
 * - 「임시저장」은 DB에 초안(DRAFT)으로 저장, 「발행하기」는 공개 목록에 올리는 상태(PUBLISHED)입니다.
 */

"use client";

import { forwardRef, useCallback, useImperativeHandle, useMemo } from "react";
import type { PartialBlock } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import { BlockNoteView } from "@blocknote/shadcn";
import { useCreateBlockNote } from "@blocknote/react";
import type { BlogPostContent } from "@/types/blocknote";

export type NotionEditorProps = {
  /** 에디터 인스턴스를 remount할 때 사용 (글 ID 변경 등) */
  storageKey?: string;
  initialContent?: BlogPostContent | null;
  onChangeDocument?: (json: BlogPostContent) => void;
  uploadFile?: (file: File) => Promise<string>;
  editable?: boolean;
};

export type NotionEditorHandle = {
  getDocument: () => BlogPostContent;
};

function normalizeInitialBlocks(
  raw: BlogPostContent | null | undefined
): PartialBlock[] | undefined {
  if (!raw || !Array.isArray(raw) || raw.length === 0) return undefined;
  return raw as PartialBlock[];
}

export const NotionEditor = forwardRef<NotionEditorHandle, NotionEditorProps>(
  function NotionEditor(
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
  }
);
