import type { BlogPostContent, TiptapBlogContent } from "@/types/blocknote";

export type NotionEditorProps = {
  storageKey?: string;
  initialContent?: BlogPostContent | null;
  onChangeDocument?: (json: TiptapBlogContent) => void;
  uploadFile?: (file: File) => Promise<string>;
  /** 붙여넣기 HTML의 외부 img URL → Supabase (CORS 회피) */
  importRemoteImage?: (url: string) => Promise<string>;
  editable?: boolean;
};

export type NotionEditorHandle = {
  getDocument: () => TiptapBlogContent;
};
