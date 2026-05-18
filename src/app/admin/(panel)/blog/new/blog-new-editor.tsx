"use client";

import dynamic from "next/dynamic";
import type { BlogCategoryItem } from "@/lib/blog-categories";

function EditorLoadingFallback() {
  return (
    <div className="p-10 text-center text-gray-500">
      에디터를 불러오는 중입니다...
    </div>
  );
}

const BlogEditorFormLoader = dynamic(
  () =>
    import("../blog-editor-form-loader").then((m) => ({
      default: m.BlogEditorFormLoader,
    })),
  {
    ssr: false,
    loading: EditorLoadingFallback,
  }
);

export function BlogNewEditor({
  categories,
}: {
  categories: BlogCategoryItem[];
}) {
  return <BlogEditorFormLoader mode="create" categories={categories} />;
}
