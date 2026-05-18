/**
 * [홍보팀] 블로그 본문 에디터 (BlockNote)
 */

"use client";

import dynamic from "next/dynamic";
import { forwardRef } from "react";
import type { BlockEditorHandle, BlockEditorProps } from "./block-editor-types";

export type { BlockEditorHandle, BlockEditorProps } from "./block-editor-types";

const BlockEditorInner = dynamic(
  () =>
    import("./BlockEditorInner").then((m) => ({
      default: m.BlockEditorInner,
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

export const BlockEditor = forwardRef<BlockEditorHandle, BlockEditorProps>(
  function BlockEditor(props, ref) {
    return <BlockEditorInner ref={ref} {...props} />;
  }
);
