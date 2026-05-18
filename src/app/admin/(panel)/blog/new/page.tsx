import { listBlogCategories } from "@/lib/blog-categories";
import { BlogNewEditor } from "./blog-new-editor";

export const dynamic = "force-dynamic";

export default async function AdminBlogNewPage() {
  const categories = await listBlogCategories();

  return (
    <div className="px-0 py-2">
      <BlogNewEditor categories={categories} />
    </div>
  );
}
