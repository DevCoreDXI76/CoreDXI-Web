import type { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { BlogPostList } from "@/components/blog/BlogPostList";
import type { BlogPostCard } from "@/components/blog/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "블로그 — CoreDXI",
  description: "CoreDXI 소식·인사이트·고객 사례를 만나보세요.",
};

async function getPublishedPosts(): Promise<BlogPostCard[]> {
  return prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
    select: {
      slug: true,
      title: true,
      excerpt: true,
      publishedAt: true,
      category: { select: { name: true, slug: true } },
    },
  });
}

export default async function BlogIndexPage() {
  const posts = await getPublishedPosts();

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl lg:hidden">
          블로그
        </h1>
        <p className="mt-2 text-gray-600">
          회사 소식과 기술 인사이트를 공유합니다.
        </p>
      </header>
      <Suspense
        fallback={
          <div className="py-12 text-center text-sm text-gray-500">불러오는 중…</div>
        }
      >
        <BlogPostList posts={posts} />
      </Suspense>
    </>
  );
}
