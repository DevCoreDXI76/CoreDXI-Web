import type { Ga4TopPage } from "@/lib/ga4/types";

type Props = {
  pages: Ga4TopPage[];
};

export function Ga4TopPagesTable({ pages }: Props) {
  return (
    <section
      className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm"
      aria-labelledby="ga4-top-pages-heading"
    >
      <div className="border-b border-slate-100 px-5 py-4">
        <h2
          id="ga4-top-pages-heading"
          className="text-base font-semibold text-slate-900"
        >
          인기 페이지 TOP 5
        </h2>
        <p className="mt-1 text-xs text-slate-500">최근 7일 · screenPageViews 기준</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-600">
            <tr>
              <th className="px-5 py-3">페이지 경로</th>
              <th className="px-5 py-3 whitespace-nowrap text-right">페이지뷰</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pages.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-5 py-8 text-center text-slate-500">
                  아직 수집된 페이지뷰 데이터가 없습니다.
                </td>
              </tr>
            ) : (
              pages.map((page) => (
                <tr
                  key={page.path}
                  className="transition-colors hover:bg-slate-50/80"
                >
                  <td className="px-5 py-3.5 font-medium text-slate-900">
                    {page.path}
                  </td>
                  <td className="px-5 py-3.5 text-right text-slate-600">
                    {page.pageViews.toLocaleString("ko-KR")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
