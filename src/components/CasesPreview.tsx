import Link from "next/link";
import { CaseCard } from "@/components/cases/CaseCard";
import { getPortfolios } from "@/lib/portfolio";

const PREVIEW_COUNT = 3;

export async function CasesPreview() {
  const items = await getPortfolios();
  const preview = items.slice(0, PREVIEW_COUNT);

  if (preview.length === 0) return null;

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
              성공사례
            </h2>
            <p className="mt-2 text-gray-600">
              CoreDXI와 함께한 고객사의 변화를 만나보세요.
            </p>
          </div>
          <Link
            href="/cases"
            className="text-sm font-semibold text-[#1E4E8C] hover:underline"
          >
            전체 보기 →
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {preview.map((item) => (
            <CaseCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
