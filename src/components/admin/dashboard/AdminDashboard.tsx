import { ActivityLogTable } from "./ActivityLogTable";
import { DashboardStatsGrid } from "./DashboardStatsGrid";
import { Ga4AnalyticsPanel } from "./Ga4AnalyticsPanel";
import { QuickActionsGrid } from "./QuickActionsGrid";

export function AdminDashboard() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">통합 허브</h1>
        <p className="mt-1 text-sm text-slate-500">
          CMS 전체 현황을 한눈에 확인하고, 자주 쓰는 관리 메뉴로 바로
          이동할 수 있습니다.
        </p>
      </header>

      <DashboardStatsGrid />
      <Ga4AnalyticsPanel />
      <QuickActionsGrid />
      <ActivityLogTable />
    </div>
  );
}
