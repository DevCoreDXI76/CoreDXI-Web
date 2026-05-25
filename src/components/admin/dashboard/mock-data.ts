import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  FileText,
  Home,
  Image,
  Mail,
  PenLine,
} from "lucide-react";

export type DashboardStat = {
  label: string;
  value: number | string;
  icon: LucideIcon;
  subtitle?: string;
};

export type QuickAction = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type ActivityRow = {
  id: string;
  type: "blog" | "inquiry";
  title: string;
  detail: string;
  dateLabel: string;
};

export const dashboardStats: DashboardStat[] = [
  {
    label: "블로그 글 현황",
    value: 24,
    subtitle: "발행 20 · 초안 4",
    icon: FileText,
  },
  { label: "대기 중인 고객 문의", value: 3, icon: Mail },
  { label: "등록된 성공사례", value: 12, icon: Briefcase },
  { label: "메인 화면 배너 상태", value: "운영 중", icon: Image },
];

export const quickActions: QuickAction[] = [
  { label: "새 블로그 작성하기", href: "/admin/blog/new", icon: PenLine },
  { label: "메인 텍스트 수정", href: "/admin/main", icon: Home },
  { label: "성공사례 등록", href: "/admin/cases", icon: Briefcase },
  { label: "문의 내역 확인", href: "/admin/contact", icon: Mail },
];

export const mockActivities: ActivityRow[] = [
  {
    id: "act-001",
    type: "inquiry",
    title: "김○○ 문의",
    detail: "AI 챗봇 도입 상담 · 대기",
    dateLabel: "2026-05-25 14:32",
  },
  {
    id: "act-002",
    type: "blog",
    title: "Tiptap 에디터 고도화: 링크·표·미디어까지 제품 수준 UX로",
    detail: "발행완료",
    dateLabel: "2026-05-24 11:05",
  },
  {
    id: "act-003",
    type: "inquiry",
    title: "박○○ 문의",
    detail: "홈페이지 리뉴얼 견적 · 대기",
    dateLabel: "2026-05-24 09:18",
  },
  {
    id: "act-004",
    type: "blog",
    title: "채널톡 스타일 블로그 목록 UI 구현기",
    detail: "발행완료",
    dateLabel: "2026-05-22 16:40",
  },
  {
    id: "act-005",
    type: "blog",
    title: "카카오/네이버 소셜 로그인 연동 시 발생할 수 있는 예외 처리 총정리",
    detail: "발행완료",
    dateLabel: "2026-05-20 10:22",
  },
  {
    id: "act-006",
    type: "inquiry",
    title: "이○○ 문의",
    detail: "사내 메신저 연동 가능 여부 · 답변 완료",
    dateLabel: "2026-05-21 15:50",
  },
  {
    id: "act-007",
    type: "blog",
    title: "GitHub Actions로 Next.js 15 배포 파이프라인 안정화하기",
    detail: "임시저장",
    dateLabel: "2026-05-16 18:03",
  },
  {
    id: "act-008",
    type: "blog",
    title: "Prisma JSONB로 Tiptap 콘텐츠 저장하기",
    detail: "발행완료",
    dateLabel: "2026-05-18 13:27",
  },
];
