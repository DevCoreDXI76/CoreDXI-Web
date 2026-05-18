import type { BlockNoteContent, BlogPostContent } from "@/types/blocknote";

export type BlockEditorProps = {
  storageKey?: string;
  initialContent?: BlogPostContent | null;
  onChangeDocument?: (doc: BlockNoteContent) => void;
  uploadFile?: (file: File) => Promise<string>;
  editable?: boolean;
};

export type BlockEditorHandle = {
  getDocument: () => BlockNoteContent;
};
