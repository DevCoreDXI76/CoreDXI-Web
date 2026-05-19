"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import type { TiptapBlogContent } from "@/types/blocknote";
import {
  getTiptapBlogExtensions,
  TIPTAP_BLOG_READER_CONTENT_CLASS,
} from "./tiptap-blog-extensions";

type Props = {
  content: TiptapBlogContent;
};

/** 레거시 Tiptap JSON 본문 — 읽기 전용 */
export function TiptapBlogReader({ content }: Props) {
  const editor = useEditor({
    extensions: getTiptapBlogExtensions({ editable: false }),
    content,
    editable: false,
    immediatelyRender: false,
  });

  if (!editor) {
    return <div className="min-h-[20vh] animate-pulse rounded-lg bg-gray-50" />;
  }

  return (
    <div className={TIPTAP_BLOG_READER_CONTENT_CLASS}>
      <EditorContent editor={editor} />
    </div>
  );
}
