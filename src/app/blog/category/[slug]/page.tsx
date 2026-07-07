import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getBlogCategoryBySlug } from "@/lib/blog-categories";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/seo";
import { BlogPostGrid } from "@/components/blog/BlogPostGrid";
import {
  mapBlogPostToListCard,
  type BlogPostCard,
} from "@/components/blog/types";

export const revalidate = 60;

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getBlogCategoryBySlug(slug);
  if (!category) return { title: "주제를 찾을 수 없습니다" };

  const description = category.description ?? category.name;
  const canonical = siteUrl(`/blog/category/${slug}`);

  return {
    title: category.name,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "ko_KR",
      siteName: "CoreDXI",
      title: category.name,
      description,
      url: canonical,
    },
    twitter: {
      card: "summary_large_image",
      title: category.name,
      description,
    },
  };
}

export default async function BlogCategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await getBlogCategoryBySlug(slug);
  if (!category) notFound();

  const rows: BlogPostCard[] = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED", categoryId: category.id },
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

  const posts = rows.map(mapBlogPostToListCard);

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          {category.name}
        </h1>
        {category.description ? (
          <p className="mt-2 text-slate-600">{category.description}</p>
        ) : null}
      </header>
      <Suspense
        fallback={
          <div className="py-12 text-center text-sm text-slate-500">불러오는 중…</div>
        }
      >
        <BlogPostGrid posts={posts} />
      </Suspense>
    </>
  );
}
