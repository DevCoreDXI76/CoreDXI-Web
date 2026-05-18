import type { PartialBlock } from "@blocknote/core";
import type { JSONContent } from "@tiptap/core";

/** BlockNote 문서 — Prisma `BlogPost.content` JSON 배열 */
export type BlockNoteContent = PartialBlock[];

/** 레거시 Tiptap 문서 */
export type TiptapBlogContent = JSONContent;

/** Prisma에 저장되는 본문 JSON (BlockNote 우선, Tiptap 레거시 호환) */
export type BlogPostContent = BlockNoteContent | TiptapBlogContent;

export const EMPTY_BLOCKNOTE_DOC: BlockNoteContent = [
  { type: "paragraph", content: "" },
];

/** @deprecated BlockNote 전환 이전 Tiptap 빈 문서 */
export const EMPTY_BLOG_DOC: TiptapBlogContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

export function isBlockNoteContent(value: unknown): value is BlockNoteContent {
  return (
    Array.isArray(value) &&
    (value.length === 0 ||
      value.every(
        (b) => b && typeof b === "object" && "id" in b && "type" in b
      ))
  );
}

export function isTiptapDocument(value: unknown): value is TiptapBlogContent {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    "type" in value &&
    (value as JSONContent).type === "doc"
  );
}

/** 공개/저장용 — BlockNote · Tiptap 모두 인식 */
export function normalizeBlogContent(raw: unknown): BlogPostContent {
  if (isBlockNoteContent(raw)) return raw;
  if (isTiptapDocument(raw)) return raw;
  return EMPTY_BLOCKNOTE_DOC;
}

/** 에디터 초기값 — BlockNote만 (Tiptap 글은 별도 레거시 UI) */
export function getBlockNoteEditorInitial(raw: unknown): BlockNoteContent {
  if (isBlockNoteContent(raw)) return raw;
  return EMPTY_BLOCKNOTE_DOC;
}
