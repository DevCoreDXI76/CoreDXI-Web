import { recentPosts } from "./mock-data";

function statusBadge(status: "PUBLISHED" | "DRAFT") {
  if (status === "PUBLISHED") {
    return (
      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">
        발행완료
      </span>
    );
  }
  return (
    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-900">
      임시저장
    </span>
  );
}

export function RecentPostsTable() {
  return (
    <section
      className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm lg:col-span-2"
      aria-labelledby="recent-posts-heading"
    >
      <div className="border-b border-slate-100 px-5 py-4">
        <h2
          id="recent-posts-heading"
          className="text-base font-semibold text-slate-900"
        >
          최근 작성된 블로그 포스트
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-600">
            <tr>
              <th className="px-5 py-3">제목</th>
              <th className="px-5 py-3 whitespace-nowrap">작성일</th>
              <th className="px-5 py-3 whitespace-nowrap">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {recentPosts.map((post) => (
              <tr key={post.title} className="transition-colors hover:bg-slate-50/80">
                <td className="px-5 py-3.5 font-medium text-slate-900">
                  {post.title}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap text-slate-500">
                  {post.dateLabel}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap">
                  {statusBadge(post.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
