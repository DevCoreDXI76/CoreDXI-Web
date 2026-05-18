import type { PartialBlock } from "@blocknote/core";
import type { JSONContent } from "@tiptap/core";

/** BlockNote 문서 — Prisma `BlogPost.content` JSON 배열 */
export type BlockNoteContent = PartialBlock[];

/** 레거시 Tiptap 문서 */
export type TiptapBlogContent = JSONContent;

/** Prisma에 저장되는 본문 JSON (BlockNote 우선, Tiptap 레거시 호환) */
export type BlogPostContent = BlockNoteContent | TiptapBlogContent;

export const EMPTY_BLOCKNOTE_DOC: BlockNoteContent = [{ type: "paragraph" }];

/** @deprecated BlockNote 전환 이전 Tiptap 빈 문서 */
export const EMPTY_BLOG_DOC: TiptapBlogContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

const BLOCKNOTE_BLOCK_TYPES = new Set([
  "paragraph",
  "heading",
  "bulletListItem",
  "numberedListItem",
  "checkListItem",
  "table",
  "image",
  "video",
  "audio",
  "file",
  "codeBlock",
]);

function isBlockNoteBlock(block: unknown): block is PartialBlock {
  if (!block || typeof block !== "object" || !("type" in block)) return false;
  const b = block as { id?: unknown; type?: unknown };
  return (
    typeof b.id === "string" &&
    b.id.length > 0 &&
    typeof b.type === "string" &&
    BLOCKNOTE_BLOCK_TYPES.has(b.type)
  );
}

/** BlockNote 저장본 — 블록마다 id·지원 type 필요 (빈 배열·Tiptap 유사 배열 제외) */
export function isBlockNoteContent(value: unknown): value is BlockNoteContent {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((b) => isBlockNoteBlock(b))
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

/** 잘못된 inline content(예: content: "") 정리 */
export function sanitizeBlockNoteContent(
  blocks: BlockNoteContent
): BlockNoteContent {
  const sanitized = blocks
    .filter((b) => isBlockNoteBlock(b))
    .map((block) => {
      const next = { ...block } as PartialBlock;
      if (next.content === "" || next.content === null) {
        delete next.content;
      }
      return next;
    });

  return sanitized.length > 0 ? sanitized : EMPTY_BLOCKNOTE_DOC;
}

/** 공개/저장용 — BlockNote · Tiptap 모두 인식 */
export function normalizeBlogContent(raw: unknown): BlogPostContent {
  if (isBlockNoteContent(raw)) return sanitizeBlockNoteContent(raw);
  if (isTiptapDocument(raw)) return raw;
  return EMPTY_BLOCKNOTE_DOC;
}

/** 에디터 초기값 — 유효한 BlockNote만, 아니면 빈 문서 */
export function getBlockNoteEditorInitial(raw: unknown): BlockNoteContent {
  if (isBlockNoteContent(raw)) return sanitizeBlockNoteContent(raw);
  return EMPTY_BLOCKNOTE_DOC;
}
