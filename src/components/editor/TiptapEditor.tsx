/**
 * [홍보팀] 블로그 본문 에디터 (Tiptap)
 */

"use client";

import dynamic from "next/dynamic";
import { forwardRef } from "react";
import type { TiptapEditorHandle, TiptapEditorProps } from "./tiptap-editor-types";

export type { TiptapEditorHandle, TiptapEditorProps } from "./tiptap-editor-types";

const TiptapEditorInner = dynamic(
  () =>
    import("./TiptapEditorInner").then((m) => ({
      default: m.TiptapEditorInner,
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

export const TiptapEditor = forwardRef<TiptapEditorHandle, TiptapEditorProps>(
  function TiptapEditor(props, ref) {
    return <TiptapEditorInner ref={ref} {...props} />;
  }
);
