import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BlogEditorFormLoader } from "../../blog-editor-form-loader";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminBlogEditPage({ params }: PageProps) {
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <div className="px-0 py-2">
      <BlogEditorFormLoader
        mode="edit"
        initial={{
          id: post.id,
          title: post.title,
          category: post.category,
          excerpt: post.excerpt ?? "",
          content: post.content,
          status: post.status,
        }}
      />
    </div>
  );
}
