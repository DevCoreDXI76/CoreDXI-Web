import { mockActivities } from "./mock-data";

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

export function ActivityLogTable() {
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
            {mockActivities.map((activity) => (
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
                <td className="px-5 py-3.5 text-slate-500">{activity.detail}</td>
                <td className="px-5 py-3.5 whitespace-nowrap text-slate-500">
                  {activity.dateLabel}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
