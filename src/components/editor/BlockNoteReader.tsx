"use client";

import { BlockNoteView } from "@blocknote/shadcn";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import type { BlockNoteContent } from "@/types/blocknote";

type Props = {
  blocks: BlockNoteContent;
};

/** BlockNote JSON 본문 — 읽기 전용 */
export function BlockNoteReader({ blocks }: Props) {
  const editor = useCreateBlockNote({
    initialContent: blocks,
  });

  if (!editor) {
    return <div className="min-h-[20vh] animate-pulse rounded-lg bg-gray-50" />;
  }

  return (
    <div className="max-w-none text-gray-800 [&_.bn-block-group]:space-y-1 [&_img]:my-4 [&_img]:max-w-full [&_img]:rounded-lg">
      <BlockNoteView editor={editor} editable={false} />
    </div>
  );
}
