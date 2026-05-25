import type { LucideIcon } from "lucide-react";
import { FileText, Mail, PenTool, Users } from "lucide-react";

export type DashboardStat = {
  label: string;
  value: number;
  icon: LucideIcon;
};

export type RecentPostRow = {
  title: string;
  dateLabel: string;
  status: "PUBLISHED" | "DRAFT";
};

export type RecentInquiryRow = {
  name: string;
  purpose: string;
  dateLabel: string;
};

export const dashboardStats: DashboardStat[] = [
  { label: "전체 블로그 글", value: 24, icon: FileText },
  { label: "이번 달 신규 글", value: 6, icon: PenTool },
  { label: "대기 중인 문의", value: 3, icon: Mail },
  { label: "총 회원 수", value: 128, icon: Users },
];

export const recentPosts: RecentPostRow[] = [
  {
    title:
      "카카오/네이버 소셜 로그인 연동 시 발생할 수 있는 예외 처리 총정리",
    dateLabel: "2026-05-20",
    status: "PUBLISHED",
  },
  {
    title: "Tiptap 에디터 고도화: 링크·표·미디어까지 제품 수준 UX로",
    dateLabel: "2026-05-14",
    status: "PUBLISHED",
  },
  {
    title: "Prisma JSONB로 Tiptap 콘텐츠 저장하기: 마이그레이션 없는 확장 전략",
    dateLabel: "2026-05-18",
    status: "PUBLISHED",
  },
  {
    title: "GitHub Actions로 Next.js 15 배포 파이프라인 안정화하기",
    dateLabel: "2026-05-16",
    status: "DRAFT",
  },
  {
    title: "채널톡 스타일 블로그 목록 UI 구현기",
    dateLabel: "2026-05-22",
    status: "PUBLISHED",
  },
];

export const recentInquiries: RecentInquiryRow[] = [
  {
    name: "김○○",
    purpose: "AI 챗봇 도입 상담",
    dateLabel: "2026-05-24",
  },
  {
    name: "박○○",
    purpose: "홈페이지 리뉴얼 견적 문의",
    dateLabel: "2026-05-23",
  },
  {
    name: "이○○",
    purpose: "사내 메신저 연동 가능 여부",
    dateLabel: "2026-05-21",
  },
];
