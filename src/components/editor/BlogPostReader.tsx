"use client";

import dynamic from "next/dynamic";
import {
  isBlockNoteContent,
  isTiptapDocument,
  normalizeBlogContent,
  type BlogPostContent,
} from "@/types/blocknote";

const BlockNoteReader = dynamic(
  () =>
    import("./BlockNoteReader").then((m) => ({ default: m.BlockNoteReader })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[20vh] animate-pulse rounded-lg bg-gray-50" />
    ),
  }
);

const TiptapBlogReader = dynamic(
  () =>
    import("./TiptapBlogReader").then((m) => ({ default: m.TiptapBlogReader })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[20vh] animate-pulse rounded-lg bg-gray-50" />
    ),
  }
);

type Props = {
  storageKey: string;
  content: BlogPostContent | null;
};

/** 공개 블로그 글 본문 — BlockNote · Tiptap 이중 렌더링 */
export function BlogPostReader({ content }: Props) {
  const normalized = normalizeBlogContent(content);

  if (isBlockNoteContent(normalized)) {
    return <BlockNoteReader blocks={normalized} />;
  }

  if (isTiptapDocument(normalized)) {
    return <TiptapBlogReader content={normalized} />;
  }

  return <BlockNoteReader blocks={[]} />;
}
