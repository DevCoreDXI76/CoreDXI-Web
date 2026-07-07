import { getPageContent } from "@/lib/page-content";
import { HOME_CONTENT_DEFAULTS } from "@/lib/page-content/home";
import { HomeContentForm } from "./HomeContentForm";

export const dynamic = "force-dynamic";

export default async function AdminMainPage() {
  const content = await getPageContent("home", HOME_CONTENT_DEFAULTS);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">메인 화면 관리</h1>
      <p className="mt-2 max-w-2xl text-sm text-gray-500">
        홈페이지 첫 화면(히어로) 문구·이미지·버튼을 관리합니다.
      </p>
      <div className="mt-8">
        <HomeContentForm initial={content} />
      </div>
    </div>
  );
}
