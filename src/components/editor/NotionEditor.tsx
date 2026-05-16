/**
 * [홍보팀] 노션형 블로그 에디터 (BlockNote + shadcn)
 * - `/` 슬래시 메뉴, 이미지 붙여넣기·드래그 → Supabase `blog-images` 업로드
 * - 임시저장(DRAFT) vs 발행(PUBLISHED) 차이는 폼 상단 버튼 참고
 */

"use client";

import { forwardRef, useEffect, useState } from "react";
import { NotionEditorInner } from "./NotionEditorInner";
import type { NotionEditorHandle, NotionEditorProps } from "./notion-editor-types";

export type { NotionEditorHandle, NotionEditorProps } from "./notion-editor-types";

function EditorLoading() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-12 text-center text-sm text-gray-500">
      에디터를 불러오는 중입니다…
    </div>
  );
}

export const NotionEditor = forwardRef<NotionEditorHandle, NotionEditorProps>(
  function NotionEditor(props, ref) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    if (!mounted) {
      return <EditorLoading />;
    }

    return <NotionEditorInner ref={ref} {...props} />;
  }
);
