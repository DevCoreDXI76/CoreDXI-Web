import Link from "next/link";
import { listBlogCategories } from "@/lib/blog-categories";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BlogTopicsManager } from "./BlogTopicsManager";

export const dynamic = "force-dynamic";

export default async function AdminBlogTopicsPage() {
  const categories = await listBlogCategories();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/blog"
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            ← 블로그 글 목록
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">블로그 주제</h1>
          <p className="mt-1 text-sm text-gray-500">
            공개 블로그 왼쪽 메뉴에 표시되는 주제를 관리합니다.
          </p>
        </div>
        <Link
          href="/blog"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          공개 블로그 보기
        </Link>
      </div>

      <BlogTopicsManager categories={categories} />
    </div>
  );
}
