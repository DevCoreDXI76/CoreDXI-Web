import { listBlogCategories } from "@/lib/blog-categories";
import { BlogEditorFormLoader } from "../blog-editor-form-loader";

export const dynamic = "force-dynamic";

export default async function AdminBlogNewPage() {
  const categories = await listBlogCategories();

  return (
    <div className="px-0 py-2">
      <BlogEditorFormLoader mode="create" categories={categories} />
    </div>
  );
}
