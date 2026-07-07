import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { BlogPostGrid } from "@/components/blog/BlogPostGrid";
import {
  mapBlogPostToListCard,
  type BlogPostCard,
} from "@/components/blog/types";

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: "블로그",
  description: "CoreDXI 소식·인사이트·고객 사례를 만나보세요.",
  path: "/blog",
});

async function getPublishedPosts(): Promise<BlogPostCard[]> {
  return prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
    select: {
      slug: true,
      title: true,
      excerpt: true,
      coverImageUrl: true,
      publishedAt: true,
      updatedAt: true,
      category: { select: { name: true, slug: true } },
    },
  });
}

export default async function BlogIndexPage() {
  const rows = await getPublishedPosts();
  const posts = rows.map(mapBlogPostToListCard);

  return (
    <Suspense
      fallback={
        <div className="py-12 text-center text-sm text-slate-500">불러오는 중…</div>
      }
    >
      <BlogPostGrid posts={posts} />
    </Suspense>
  );
}
