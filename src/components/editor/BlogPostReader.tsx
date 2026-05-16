"use client";

import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { normalizeBlogContent, type BlogPostContent } from "@/types/blocknote";

type Props = {
  storageKey: string;
  content: BlogPostContent | null;
};

/** 공개 블로그 글 본문 — Tiptap JSON, 읽기 전용. */
export function BlogPostReader({ content }: Props) {
  const doc = normalizeBlogContent(content);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Link.configure({ openOnClick: true }),
      Image,
    ],
    content: doc,
    editable: false,
    immediatelyRender: false,
  });

  if (!editor) {
    return <div className="min-h-[20vh] animate-pulse rounded-lg bg-gray-50" />;
  }

  return (
    <div className="prose prose-gray max-w-none [&_img]:rounded-lg">
      <EditorContent editor={editor} />
    </div>
  );
}
