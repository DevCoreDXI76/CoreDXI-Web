import { BlogEditorForm } from "../blog-editor-form";

export const dynamic = "force-dynamic";

export default function AdminBlogNewPage() {
  return (
    <div className="px-0 py-2">
      <BlogEditorForm mode="create" />
    </div>
  );
}
