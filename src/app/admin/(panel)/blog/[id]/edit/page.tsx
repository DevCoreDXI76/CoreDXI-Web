import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { BlogPostContent } from "@/types/blocknote";
import { BlogEditorForm } from "../../blog-editor-form";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminBlogEditPage({ params }: PageProps) {
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) notFound();

  const content = post.content as unknown as BlogPostContent;

  return (
    <div className="px-0 py-2">
      <BlogEditorForm
        mode="edit"
        initial={{
          id: post.id,
          title: post.title,
          category: post.category,
          excerpt: post.excerpt ?? "",
          content: Array.isArray(content) ? content : [],
          status: post.status,
        }}
      />
    </div>
  );
}
