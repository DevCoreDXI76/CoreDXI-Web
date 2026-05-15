import Link from "next/link";

export function SetupDbError({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
      <div className="max-w-md text-center">
        <h1 className="text-lg font-semibold text-gray-900">
          시스템 설정을 불러올 수 없습니다
        </h1>
        <p className="mt-3 text-sm text-gray-600 whitespace-pre-wrap">{message}</p>
        <p className="mt-4 text-xs text-gray-500">
          Vercel 대시보드 → 해당 프로젝트 → Settings → Environment Variables에서
          <code className="mx-1 rounded bg-gray-100 px-1">DATABASE_URL</code>
          을 확인하고, Supabase/Postgres 연결 문자열(
          <code className="mx-1 rounded bg-gray-100 px-1">?sslmode=require</code> 등)을
          설정한 뒤 재배포해 주세요.
        </p>
        <Link
          href="/admin/login"
          className="mt-6 inline-block text-sm font-medium text-primary hover:underline"
        >
          관리자 로그인 화면으로
        </Link>
      </div>
    </div>
  );
}
