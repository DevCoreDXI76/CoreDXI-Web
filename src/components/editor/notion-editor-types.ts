import type { BlogPostContent, TiptapBlogContent } from "@/types/blocknote";

export type NotionEditorProps = {
  storageKey?: string;
  initialContent?: BlogPostContent | null;
  onChangeDocument?: (json: TiptapBlogContent) => void;
  uploadFile?: (file: File) => Promise<string>;
  editable?: boolean;
};

export type NotionEditorHandle = {
  getDocument: () => TiptapBlogContent;
};
