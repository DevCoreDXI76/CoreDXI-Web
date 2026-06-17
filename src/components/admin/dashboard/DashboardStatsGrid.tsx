import { Briefcase, FileText, Mail, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { DashboardStatCard } from "./DashboardStatCard";

async function getDashboardStats() {
  const [publishedCount, draftCount, portfolioCount, userCount] =
    await Promise.all([
      prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
      prisma.blogPost.count({ where: { status: "DRAFT" } }),
      prisma.portfolio.count(),
      prisma.user.count(),
    ]);

  let pendingInquiries = 0;
  const supabase = createSupabaseAdmin();
  if (supabase) {
    const { count } = await supabase
      .from("contacts")
      .select("*", { count: "exact", head: true })
      .eq("status", "PENDING");
    pendingInquiries = count ?? 0;
  }

  return { publishedCount, draftCount, portfolioCount, userCount, pendingInquiries };
}

export async function DashboardStatsGrid() {
  const stats = await getDashboardStats();

  const cards = [
    {
      label: "블로그 글 현황",
      value: stats.publishedCount + stats.draftCount,
      subtitle: `발행 ${stats.publishedCount} · 초안 ${stats.draftCount}`,
      icon: FileText,
    },
    {
      label: "대기 중인 고객 문의",
      value: stats.pendingInquiries,
      icon: Mail,
    },
    {
      label: "등록된 성공사례",
      value: stats.portfolioCount,
      icon: Briefcase,
    },
    {
      label: "가입 회원 수",
      value: stats.userCount,
      icon: Users,
    },
  ];

  return (
    <section aria-label="CMS 현황 요약">
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
