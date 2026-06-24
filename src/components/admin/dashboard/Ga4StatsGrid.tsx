import { BarChart3, Eye, MousePointerClick, Users } from "lucide-react";
import type { Ga4SummaryMetrics } from "@/lib/ga4/types";
import { DashboardStatCard } from "./DashboardStatCard";

type Props = {
  summary: Ga4SummaryMetrics;
};

export function Ga4StatsGrid({ summary }: Props) {
  const cards = [
    {
      label: "오늘 활성 사용자",
      value: summary.activeUsersToday,
      subtitle: "GA4 activeUsers · 오늘",
      icon: Users,
    },
    {
      label: "최근 7일 활성 사용자",
      value: summary.activeUsers7Days,
      subtitle: "GA4 activeUsers · 7일",
      icon: BarChart3,
    },
    {
      label: "최근 7일 세션",
      value: summary.sessions7Days,
      subtitle: "GA4 sessions · 7일",
      icon: MousePointerClick,
    },
    {
      label: "최근 7일 페이지뷰",
      value: summary.pageViews7Days,
      subtitle: `신규 사용자 ${summary.newUsers7Days.toLocaleString("ko-KR")}명`,
      icon: Eye,
    },
  ];

  return (
    <section aria-label="GA4 방문자 요약">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((stat) => (
          <DashboardStatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            subtitle={stat.subtitle}
            icon={stat.icon}
          />
        ))}
      </div>
    </section>
  );
}
