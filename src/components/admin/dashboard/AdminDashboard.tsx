import { DashboardStatsGrid } from "./DashboardStatsGrid";
import { InquiriesAndQuickActions } from "./InquiriesAndQuickActions";
import { RecentPostsTable } from "./RecentPostsTable";

export function AdminDashboard() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">대시보드</h1>
        <p className="mt-1 text-sm text-slate-500">
          CMS 현황을 한눈에 확인하고, 자주 쓰는 작업으로 바로 이동할 수
          있습니다.
        </p>
      </header>

      <DashboardStatsGrid />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <RecentPostsTable />
        <InquiriesAndQuickActions />
      </div>
    </div>
  );
}
