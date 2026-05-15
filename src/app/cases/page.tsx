import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { CaseCard } from "@/components/cases/CaseCard";
import { getPortfolios } from "@/lib/portfolio";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "성공사례 — CoreDXI",
  description:
    "CoreDXI와 함께한 고객사의 AX 전환 성공사례를 확인하세요.",
};

export default async function CasesPage() {
  const items = await getPortfolios();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              성공사례
            </h1>
            <p className="mt-2 text-gray-600">
              고객사와 함께 만든 DX·AX 전환의 성과를 소개합니다.
            </p>
          </div>

          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center text-gray-500">
              등록된 성공사례가 없습니다.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <CaseCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
