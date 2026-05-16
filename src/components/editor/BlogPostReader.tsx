import type { BlogPostContent } from "@/types/blocknote";
import { NotionEditor } from "./NotionEditor";

type Props = {
  storageKey: string;
  content: BlogPostContent | null;
};

/** 공개 블로그 글 본문 — `NotionEditor`와 동일 JSON, 읽기 전용. */
export function BlogPostReader({ storageKey, content }: Props) {
  return (
    <NotionEditor
      storageKey={storageKey}
      initialContent={content}
      editable={false}
    />
  );
}
