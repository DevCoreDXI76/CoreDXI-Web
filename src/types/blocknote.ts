import type { PartialBlock } from "@blocknote/core";

/** BlockNote 문서(JSON). Prisma `BlogPost.content` 와 동일 구조로 저장합니다. */
export type BlogPostContent = PartialBlock[];
