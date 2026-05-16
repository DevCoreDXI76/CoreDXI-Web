import type { BlogPostContent } from "@/types/blocknote";

export type NotionEditorProps = {
  storageKey?: string;
  initialContent?: BlogPostContent | null;
  onChangeDocument?: (json: BlogPostContent) => void;
  uploadFile?: (file: File) => Promise<string>;
  editable?: boolean;
};

export type NotionEditorHandle = {
  getDocument: () => BlogPostContent;
};
