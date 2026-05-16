import { listBlogCategories } from "@/lib/blog-categories";
import { BlogShell } from "@/components/blog/BlogShell";

export const dynamic = "force-dynamic";

export default async function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await listBlogCategories();
  return <BlogShell categories={categories}>{children}</BlogShell>;
}
