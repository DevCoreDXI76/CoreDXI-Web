import { dashboardStats } from "./mock-data";
import { DashboardStatCard } from "./DashboardStatCard";

export function DashboardStatsGrid() {
  return (
    <section aria-label="요약 통계">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat) => (
          <DashboardStatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
          />
        ))}
      </div>
    </section>
  );
}
