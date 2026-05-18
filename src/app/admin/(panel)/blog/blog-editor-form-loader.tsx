"use client";

import type { BlogCategoryItem } from "@/lib/blog-categories";
import { BlogEditorForm } from "./blog-editor-form";
import type { BlogEditorInitial } from "./blog-editor-form";

type Props = {
  mode: "create" | "edit";
  categories: BlogCategoryItem[];
  initial?: BlogEditorInitial;
};

/** 블로그 글쓰기 폼 — 페이지 레벨 dynamic(ssr:false) 뒤 클라이언트에서만 마운트 */
export function BlogEditorFormLoader({ mode, categories, initial }: Props) {
  return (
    <BlogEditorForm mode={mode} categories={categories} initial={initial} />
  );
}
