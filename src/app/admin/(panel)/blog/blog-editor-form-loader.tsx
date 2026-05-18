"use client";

import dynamic from "next/dynamic";
import type { BlogCategoryItem } from "@/lib/blog-categories";
import type { BlogEditorInitial } from "./blog-editor-form";

const BlogEditorForm = dynamic(
  () =>
    import("./blog-editor-form").then((m) => ({
      default: m.BlogEditorForm,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-500">
        글쓰기 화면을 불러오는 중입니다…
      </div>
    ),
  }
);

type Props = {
  mode: "create" | "edit";
  categories: BlogCategoryItem[];
  initial?: BlogEditorInitial;
};

/** BlockNote 에디터 포함 폼 — 브라우저에서만 마운트 (SSR/hydration 오류 방지). */
export function BlogEditorFormLoader({ mode, categories, initial }: Props) {
  return (
    <BlogEditorForm mode={mode} categories={categories} initial={initial} />
  );
}
