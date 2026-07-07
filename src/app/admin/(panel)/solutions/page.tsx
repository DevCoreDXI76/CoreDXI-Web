import { getPageContent } from "@/lib/page-content";
import { SOLUTIONS_CONTENT_DEFAULTS } from "@/lib/page-content/solutions";
import { SolutionsContentForm } from "./SolutionsContentForm";

export const dynamic = "force-dynamic";

export default async function AdminSolutionsPage() {
  const content = await getPageContent("solutions", SOLUTIONS_CONTENT_DEFAULTS);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">솔루션 관리</h1>
      <p className="mt-2 max-w-2xl text-sm text-gray-500">
        /solutions 페이지의 문구를 관리합니다.
      </p>
      <div className="mt-8">
        <SolutionsContentForm initial={content} />
      </div>
    </div>
  );
}
