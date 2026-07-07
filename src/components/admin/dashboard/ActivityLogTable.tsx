import { prisma } from "@/lib/prisma";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { formatKstDateTime } from "@/lib/format-kst-date";
import { getContactStatusLabel, normalizeContactStatus } from "@/lib/contact-status";

type ActivityRow = {
  id: string;
  type: "blog" | "inquiry";
  title: string;
  detail: string;
  dateLabel: string;
  sortKey: number;
};

const ACTIVITY_LIMIT = 8;

function blogStatusDetail(status: string): string {
  return status === "PUBLISHED" ? "발행완료" : "임시저장";
}

async function getRecentBlogActivity(): Promise<ActivityRow[]> {
  const posts = await prisma.blogPost.findMany({
    orderBy: { updatedAt: "desc" },
    take: ACTIVITY_LIMIT,
    select: { id: true, title: true, status: true, updatedAt: true },
  });

  return posts.map((post) => ({
    id: `blog-${post.id}`,
    type: "blog" as const,
    title: post.title,
    detail: blogStatusDetail(post.status),
    dateLabel: formatKstDateTime(post.updatedAt),
    sortKey: post.updatedAt.getTime(),
  }));
}

async function getRecentInquiryActivity(): Promise<ActivityRow[]> {
  const supabase = createSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("contacts")
    .select("id, name, type, status, created_at")
    .order("created_at", { ascending: false })
    .limit(ACTIVITY_LIMIT);

  if (error || !data) return [];

  return data.map((row) => ({
    id: `inquiry-${row.id}`,
    type: "inquiry" as const,
    title: `${row.name} 문의`,
    detail: `${row.type} · ${getContactStatusLabel(normalizeContactStatus(row.status))}`,
    dateLabel: formatKstDateTime(row.created_at),
    sortKey: new Date(row.created_at).getTime(),
  }));
}

async function getRecentActivity(): Promise<ActivityRow[]> {
  const [blogActivity, inquiryActivity] = await Promise.all([
    getRecentBlogActivity(),
    getRecentInquiryActivity(),
  ]);

  return [...blogActivity, ...inquiryActivity]
    .sort((a, b) => b.sortKey - a.sortKey)
    .slice(0, ACTIVITY_LIMIT);
}

function typeBadge(type: "blog" | "inquiry") {
  if (type === "blog") {
    return (
      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">
        블로그
      </span>
    );
  }
  return (
    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-800">
      문의
    </span>
  );
}

export async function ActivityLogTable() {
  const activities = await getRecentActivity();

  return (
    <section
      className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm"
      aria-labelledby="activity-log-heading"
    >
      <div className="border-b border-slate-100 px-5 py-4">
        <h2
          id="activity-log-heading"
          className="text-base font-semibold text-slate-900"
        >
          최근 업데이트 및 활동
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-600">
            <tr>
              <th className="px-5 py-3 whitespace-nowrap">유형</th>
              <th className="px-5 py-3">내용</th>
              <th className="px-5 py-3 whitespace-nowrap">상세</th>
              <th className="px-5 py-3 whitespace-nowrap">일시</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {activities.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-10 text-center text-slate-500"
                >
                  아직 활동 내역이 없습니다.
                </td>
              </tr>
            ) : (
              activities.map((activity) => (
                <tr
                  key={activity.id}
                  className="transition-colors hover:bg-slate-50/80"
                >
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    {typeBadge(activity.type)}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-slate-900">
                    {activity.title}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">
                    {activity.detail}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-slate-500">
                    {activity.dateLabel}
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
