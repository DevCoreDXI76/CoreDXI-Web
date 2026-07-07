import type { BlogPostContent } from "@/types/blocknote";

export type BlogEditorInitial = {
  id: string;
  title: string;
  categoryId: string;
  excerpt: string;
  coverImageUrl?: string | null;
  content: BlogPostContent | unknown;
  status: "DRAFT" | "PUBLISHED";
};
