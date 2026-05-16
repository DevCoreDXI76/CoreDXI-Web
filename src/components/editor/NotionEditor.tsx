/**
 * [홍보팀] 노션형 블로그 에디터 (BlockNote + Mantine)
 * - `/` 슬래시 메뉴, 이미지 붙여넣기·드래그 → Supabase `blog-images` 업로드
 */

"use client";

import dynamic from "next/dynamic";
import { forwardRef } from "react";
import type { NotionEditorHandle, NotionEditorProps } from "./notion-editor-types";

export type { NotionEditorHandle, NotionEditorProps } from "./notion-editor-types";

const NotionEditorInner = dynamic(
  () =>
    import("./NotionEditorInner").then((m) => ({
      default: m.NotionEditorInner,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-lg border border-gray-200 bg-white px-4 py-12 text-center text-sm text-gray-500">
        에디터를 불러오는 중입니다…
      </div>
    ),
  }
);

export const NotionEditor = forwardRef<NotionEditorHandle, NotionEditorProps>(
  function NotionEditor(props, ref) {
    return <NotionEditorInner ref={ref} {...props} />;
  }
);
