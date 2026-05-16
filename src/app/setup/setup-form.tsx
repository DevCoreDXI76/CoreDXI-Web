/**
 * 최초 1회 관리자 온보딩 폼 (클라이언트)
 */

"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { completeInitialSetup } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  setupSecretRequired: boolean;
};

export function InitialSetupForm({ setupSecretRequired }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [setupSecret, setSetupSecret] = useState("");
  const [pending, setPending] = useState(false);

  const isEmailOk = email.includes("@") && email.includes(".");
  const canSubmit =
    name.trim().length > 0 &&
    isEmailOk &&
    password.length >= 8 &&
    password === passwordConfirm &&
    (!setupSecretRequired || setupSecret.trim().length > 0);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || pending) return;

    setPending(true);
    try {
      const result = await completeInitialSetup({
        name: name.trim(),
        email,
        password,
        passwordConfirm,
        setupSecret: setupSecretRequired ? setupSecret.trim() : undefined,
      });
      if (result.success) {
        toast.success("최초 관리자 계정이 등록되었습니다. 로그인해 주세요.");
        router.push("/admin/login?setup=complete");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="flex items-center justify-between border-b border-border/40 px-6 py-4">
        <Logo
          size={30}
          showWordmark
          wordmarkClassName="text-lg font-bold text-primary tracking-tight"
        />
        <Link
          href="/admin/login"
          className="text-sm font-medium text-primary hover:underline"
        >
          관리자 로그인
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            시스템 최초 설정
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            최초 한 번만 최고 관리자(SUPER_ADMIN) 계정과 비밀번호를 등록합니다.
            완료 후 이 화면은 더 이상 사용할 수 없습니다.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="space-y-1.5">
            <Label htmlFor="setup-name">
              이름 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="setup-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              autoComplete="name"
              disabled={pending}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="setup-email">
              관리자 이메일 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="setup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@coredxi.com"
              autoComplete="email"
              disabled={pending}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="setup-password">
              비밀번호 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="setup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8자 이상"
              autoComplete="new-password"
              disabled={pending}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="setup-password-confirm">
              비밀번호 확인 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="setup-password-confirm"
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="비밀번호 재입력"
              autoComplete="new-password"
              disabled={pending}
              className="rounded-xl"
            />
          </div>

          {setupSecretRequired ? (
            <div className="space-y-1.5">
              <Label htmlFor="setup-secret">
                설정 토큰 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="setup-secret"
                type="password"
                value={setupSecret}
                onChange={(e) => setSetupSecret(e.target.value)}
                placeholder="환경 변수 SETUP_SECRET과 동일한 값"
                autoComplete="off"
                disabled={pending}
                className="rounded-xl"
              />
              <p className="text-xs text-muted-foreground">
                서버 `.env`의 `SETUP_SECRET` 값을 입력하세요.
              </p>
            </div>
          ) : null}

          <Button
            type="submit"
            disabled={!canSubmit || pending}
            className="w-full rounded-xl bg-primary font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-40"
          >
            {pending ? "저장 중…" : "최초 관리자 등록"}
          </Button>
        </form>
      </main>
    </div>
  );
}
