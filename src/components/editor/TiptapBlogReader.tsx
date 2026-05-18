"use client";

import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type { TiptapBlogContent } from "@/types/blocknote";
import { Iframe } from "./iframe-extension";

type Props = {
  content: TiptapBlogContent;
};

/** 레거시 Tiptap JSON 본문 — 읽기 전용 */
export function TiptapBlogReader({ content }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Link.configure({ openOnClick: true }),
      Image,
      Iframe,
    ],
    content,
    editable: false,
    immediatelyRender: false,
  });

  if (!editor) {
    return <div className="min-h-[20vh] animate-pulse rounded-lg bg-gray-50" />;
  }

  return (
    <div className="max-w-none text-gray-800 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-semibold [&_iframe]:my-6 [&_iframe]:aspect-video [&_iframe]:w-full [&_iframe]:rounded-lg [&_img]:my-4 [&_img]:max-w-full [&_img]:rounded-lg [&_p]:my-3 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6">
      <EditorContent editor={editor} />
    </div>
  );
}
