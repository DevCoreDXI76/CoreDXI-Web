import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { BlogPostReader } from "@/components/editor/BlogPostReader";
import { prisma } from "@/lib/prisma";
import type { BlogPostContent } from "@/types/blocknote";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: { title: true, excerpt: true },
  });
  if (!post) {
    return { title: "글을 찾을 수 없습니다 — CoreDXI" };
  }
  return {
    title: `${post.title} — CoreDXI 블로그`,
    description: post.excerpt ?? post.title,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await prisma.blogPost.findFirst({
    where: { slug, status: "PUBLISHED" },
  });
  if (!post) notFound();

  const content = post.content as unknown as BlogPostContent;
  const blocks: BlogPostContent = Array.isArray(content) ? content : [];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-24 pb-20">
        <article className="mx-auto max-w-3xl px-4 py-12">
          <p className="text-sm font-medium text-[#1E4E8C]">{post.category}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            {post.title}
          </h1>
          {post.excerpt ? (
            <p className="mt-4 text-lg text-gray-600">{post.excerpt}</p>
          ) : null}
          {post.publishedAt ? (
            <p className="mt-4 text-sm text-gray-400">
              {post.publishedAt.toLocaleDateString("ko-KR")}
            </p>
          ) : null}

          <div className="mt-10 rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-8">
            <BlogPostReader storageKey={post.id} content={blocks} />
          </div>
        </article>
      </main>
    </>
  );
}
