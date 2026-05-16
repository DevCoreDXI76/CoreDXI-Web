import type { JSONContent } from "@tiptap/core";

/** Tiptap 문서(JSON). Prisma `BlogPost.content` 와 동일 구조로 저장합니다. */
export type BlogPostContent = JSONContent;

export const EMPTY_BLOG_DOC: BlogPostContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

/** BlockNote(배열) 또는 Tiptap(doc) JSON 정규화 */
export function normalizeBlogContent(raw: unknown): BlogPostContent {
  if (
    raw &&
    typeof raw === "object" &&
    !Array.isArray(raw) &&
    "type" in raw &&
    (raw as JSONContent).type === "doc"
  ) {
    return raw as BlogPostContent;
  }
  return EMPTY_BLOG_DOC;
}

export function isTiptapDocument(
  value: unknown
): value is BlogPostContent {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    "type" in value &&
    (value as JSONContent).type === "doc"
  );
}
