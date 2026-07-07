import type { LucideIcon } from "lucide-react";
import { Briefcase, Home, Mail, PenLine } from "lucide-react";

export type QuickAction = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const quickActions: QuickAction[] = [
  { label: "새 블로그 작성하기", href: "/admin/blog/new", icon: PenLine },
  { label: "메인 텍스트 수정", href: "/admin/main", icon: Home },
  { label: "성공사례 등록", href: "/admin/cases", icon: Briefcase },
  { label: "문의 내역 확인", href: "/admin/contact", icon: Mail },
];
