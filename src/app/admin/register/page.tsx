/**
 * src/app/admin/register/page.tsx — 관리자 등록 페이지 (/admin/register 경로)
 *
 * 이름, 이메일, 권한 등급을 입력하여 새 관리자 계정을 생성합니다.
 * 등록 성공 시 Toast 알림 후 /admin/users 목록 페이지로 이동합니다.
 *
 * [개발팀 안내]
 * - createAdmin Server Action을 통해 Prisma로 DB에 저장합니다.
 * - shadcn/ui: Input, Select, Button, Label 컴포넌트 사용
 * - sonner toast로 성공/실패 피드백 제공
 *
 * ── 변경 이력 ──────────────────────────────────────────────────────
 * v0.1  2026-05-14  최초 생성
 *       - REGISTER_CONTENT 객체로 텍스트 중앙 관리
 *       - 이름/이메일/권한 폼 구현
 *       - createAdmin Server Action 호출 + sonner Toast
 * ────────────────────────────────────────────────────────────────────
 *
 * [홍보팀 수정 안내]
 * 이 페이지의 텍스트(제목, 라벨, 버튼 문구 등)는
 * 아래 REGISTER_CONTENT 객체에서 수정하세요.
 */

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAdmin } from "../actions";
import { Role } from "@/generated/prisma";

// =====================================================
// [홍보팀] 이 페이지에 표시되는 모든 텍스트를 여기서 수정하세요.
// =====================================================
const REGISTER_CONTENT = {
  pageTitle: "새 관리자 등록",
  pageDesc: "등록된 관리자만 CoreDXI 관리자 페이지에 접근할 수 있습니다.",
  nameLabel: "이름",
  namePlaceholder: "홍길동",
  emailLabel: "이메일",
  emailPlaceholder: "hong@coredxi.com",
  roleLabel: "초기 권한",
  cancelText: "취소",
  submitText: "등록하기",
  submittingText: "등록 중...",
} as const;

// 권한 등급 선택 옵션
const ROLE_OPTIONS: { value: Role; label: string; desc: string }[] = [
  {
    value: "SUPER_ADMIN",
    label: "SUPER_ADMIN",
    desc: "모든 기능 + 관리자 등록/삭제",
  },
  { value: "EDITOR", label: "EDITOR", desc: "콘텐츠 수정 가능" },
  { value: "VIEWER", label: "VIEWER", desc: "조회 전용 (기본값)" },
];

export default function AdminRegisterPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // 폼 상태
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("VIEWER");

  // 폼 유효성 검사
  const isValidEmail = email.includes("@") && email.includes(".");
  const isFormValid = name.trim().length > 0 && isValidEmail;

  // 폼 제출 핸들러
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid) return;

    startTransition(async () => {
      const result = await createAdmin({ name: name.trim(), email, role });

      if (result.success) {
        toast.success(result.message);
        router.push("/admin/users");
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-10">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {REGISTER_CONTENT.pageTitle}
        </h1>
        <p className="mt-1 text-sm text-gray-500">{REGISTER_CONTENT.pageDesc}</p>
      </div>

      {/* 등록 폼 */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-5 shadow-sm"
      >
        {/* 이름 입력 */}
        <div className="space-y-1.5">
          <Label htmlFor="name">
            {REGISTER_CONTENT.nameLabel}{" "}
            <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            type="text"
            placeholder={REGISTER_CONTENT.namePlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
            required
          />
        </div>

        {/* 이메일 입력 */}
        <div className="space-y-1.5">
          <Label htmlFor="email">
            {REGISTER_CONTENT.emailLabel}{" "}
            <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder={REGISTER_CONTENT.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
            required
          />
        </div>

        {/* 권한 선택 */}
        <div className="space-y-1.5">
          <Label htmlFor="role">
            {REGISTER_CONTENT.roleLabel}{" "}
            <span className="text-red-500">*</span>
          </Label>
          <Select
            value={role}
            onValueChange={(v) => setRole(v as Role)}
            disabled={isPending}
          >
            <SelectTrigger id="role" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {/* [홍보팀] 권한 등급 옵션은 개발팀에 문의해야 수정할 수 있습니다. */}
              {ROLE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <span className="font-medium">{opt.label}</span>
                  <span className="ml-2 text-xs text-gray-400">{opt.desc}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => router.push("/admin/users")}
            disabled={isPending}
          >
            {REGISTER_CONTENT.cancelText}
          </Button>
          <Button
            type="submit"
            className="flex-1 text-white"
            style={{ backgroundColor: "#1E4E8C" }}
            disabled={!isFormValid || isPending}
          >
            {isPending
              ? REGISTER_CONTENT.submittingText
              : REGISTER_CONTENT.submitText}
          </Button>
        </div>
      </form>
    </div>
  );
}
