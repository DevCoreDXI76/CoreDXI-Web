/**
 * not-found.tsx
 *
 * 존재하지 않는 URL 접근 시 표시되는 404 페이지입니다.
 * 검색엔진이 색인하지 않도록 noindex를 적용합니다.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "페이지를 찾을 수 없습니다",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex min-h-[60vh] flex-col items-center justify-center bg-background px-4 py-24 text-center">
        {/* [홍보팀] 404 화면에 보이는 제목과 안내 문구입니다. */}
        <p className="text-sm font-semibold text-primary">404</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
          요청하신 주소가 변경되었거나 삭제되었을 수 있습니다. 홈으로 돌아가서
          다시 탐색해 보세요.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90"
        >
          홈으로 이동
        </Link>
      </main>
      <Footer />
    </>
  );
}
