import type { JSONContent } from "@tiptap/core";

/** 블로그 본문 JSON (Tiptap 문서) */
export type TiptapBlogContent = JSONContent;

/** Prisma에 저장되는 본문 JSON */
export type BlogPostContent = TiptapBlogContent;

/** DB·상태용 빈 본문 */
export const EMPTY_BLOG_DOC: TiptapBlogContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

export function isTiptapDocument(value: unknown): value is TiptapBlogContent {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    "type" in value &&
    (value as JSONContent).type === "doc"
  );
}

/** 공개/저장용 — Tiptap 문서만 인식, 그 외는 빈 문서로 대체 */
export function normalizeBlogContent(raw: unknown): BlogPostContent {
  if (isTiptapDocument(raw)) return raw;
  return EMPTY_BLOG_DOC;
}
