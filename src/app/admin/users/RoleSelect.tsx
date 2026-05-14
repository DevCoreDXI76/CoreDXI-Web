/**
 * RoleSelect.tsx — 권한 즉시 변경 Select 컴포넌트 (클라이언트)
 *
 * 관리자 목록 테이블의 각 행에서 드롭다운으로 권한을 즉시 변경합니다.
 * 변경 즉시 updateUserRole Server Action을 호출하고 Toast로 결과를 표시합니다.
 *
 * [개발팀 안내]
 * Server Component인 users/page.tsx에서 인터랙션이 필요한 이 부분만
 * "use client" 컴포넌트로 분리합니다 (Next.js 권장 패턴).
 *
 * ── 변경 이력 ──────────────────────────────────────────────────────
 * v0.1  2026-05-14  최초 생성
 * ────────────────────────────────────────────────────────────────────
 */

"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateUserRole } from "../actions";
import { Role } from "@/generated/prisma";

interface RoleSelectProps {
  userId: string;
  currentRole: Role;
}

// 권한 등급 옵션 정의
const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "SUPER_ADMIN", label: "SUPER_ADMIN" },
  { value: "EDITOR", label: "EDITOR" },
  { value: "VIEWER", label: "VIEWER" },
];

export function RoleSelect({ userId, currentRole }: RoleSelectProps) {
  const [isPending, startTransition] = useTransition();

  function handleChange(newRole: string) {
    startTransition(async () => {
      const result = await updateUserRole(userId, newRole as Role);

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <Select
      defaultValue={currentRole}
      onValueChange={handleChange}
      disabled={isPending}
    >
      <SelectTrigger className="w-36 h-8 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {/* [개발팀] 권한 등급을 추가/변경하려면 ROLE_OPTIONS 배열을 수정하세요. */}
        {ROLE_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value} className="text-xs">
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
