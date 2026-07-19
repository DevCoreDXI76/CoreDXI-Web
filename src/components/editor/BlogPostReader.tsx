"use client";

import dynamic from "next/dynamic";
import { normalizeBlogContent, type BlogPostContent } from "@/types/blocknote";

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

/** 공개 블로그 글 본문 렌더링 */
export function BlogPostReader({ content }: Props) {
  return <TiptapBlogReader content={normalizeBlogContent(content)} />;
}
