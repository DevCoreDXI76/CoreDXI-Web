import { notFound } from "next/navigation";
import { listBlogCategories } from "@/lib/blog-categories";
import { prisma } from "@/lib/prisma";
import { BlogEditorFormLoader } from "../../blog-editor-form-loader";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminBlogEditPage({ params }: PageProps) {
  const { id } = await params;
  const [post, categories] = await Promise.all([
    prisma.blogPost.findUnique({ where: { id } }),
    listBlogCategories(),
  ]);
  if (!post) notFound();

  return (
    <div className="px-0 py-2">
      <BlogEditorFormLoader
        mode="edit"
        categories={categories}
        initial={{
          id: post.id,
          title: post.title,
          categoryId: post.categoryId,
          excerpt: post.excerpt ?? "",
          content: post.content,
          status: post.status,
        }}
      />
    </div>
  );
}
