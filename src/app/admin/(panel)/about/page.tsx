import { getPageContent } from "@/lib/page-content";
import { ABOUT_CONTENT_DEFAULTS } from "@/lib/page-content/about";
import { AboutContentForm } from "./AboutContentForm";

export const dynamic = "force-dynamic";

export default async function AdminAboutPage() {
  const content = await getPageContent("about", ABOUT_CONTENT_DEFAULTS);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">회사소개 관리</h1>
      <p className="mt-2 max-w-2xl text-sm text-gray-500">
        /about 페이지의 문구를 관리합니다.
      </p>
      <div className="mt-8">
        <AboutContentForm initial={content} />
      </div>
    </div>
  );
}
