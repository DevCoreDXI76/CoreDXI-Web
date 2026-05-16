import { BlogEditorFormLoader } from "../blog-editor-form-loader";

export default function AdminBlogNewPage() {
  return (
    <div className="px-0 py-2">
      <BlogEditorFormLoader mode="create" />
    </div>
  );
}
