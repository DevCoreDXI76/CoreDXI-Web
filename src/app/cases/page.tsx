import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Header } from "@/components/Header";
import { CaseFilterGrid } from "@/components/cases/CaseFilterGrid";
import { getPortfolios } from "@/lib/portfolio";

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: "성공사례",
  description: "CoreDXI와 함께한 고객사의 AX 전환 성공사례를 확인하세요.",
  path: "/cases",
});

export default async function CasesPage() {
  const items = await getPortfolios();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-24 pb-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              성공사례
            </h1>
            <p className="mt-2 text-muted-foreground">
              고객사와 함께 만든 DX·AX 전환의 성과를 소개합니다.
            </p>
          </div>

          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center text-muted-foreground">
              등록된 성공사례가 없습니다.
            </div>
          ) : (
            <CaseFilterGrid initialItems={items} />
          )}
        </div>
      </main>
    </>
  );
}
