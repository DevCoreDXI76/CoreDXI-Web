"use client";

import dynamic from "next/dynamic";
import type { BlogPostContent } from "@/types/blocknote";

const NotionEditor = dynamic(
  () =>
    import("./NotionEditor").then((m) => ({
      default: m.NotionEditor,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[30vh] animate-pulse rounded-lg bg-gray-100" />
    ),
  }
);

type Props = {
  storageKey: string;
  content: BlogPostContent | null;
};

/** 공개 블로그 글 본문 — BlockNote JSON, 읽기 전용. */
export function BlogPostReader({ storageKey, content }: Props) {
  return (
    <NotionEditor
      storageKey={storageKey}
      initialContent={content}
      editable={false}
    />
  );
}
