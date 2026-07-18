/**
 * [OAuth 환경변수 — .env.local]
 * GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
 * KAKAO_CLIENT_ID, KAKAO_CLIENT_SECRET
 * NAVER_CLIENT_ID, NAVER_CLIENT_SECRET
 * AUTH_SECRET, AUTH_URL (또는 NEXTAUTH_URL)
 *
 * 콜백: {AUTH_URL}/api/auth/callback/google|kakao|naver
 */

"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { LoginSocialPanel } from "@/components/login/LoginSocialPanel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAuthHealthCheck } from "./useAuthHealthCheck";
import { UserCredentialsLoginForm } from "./UserCredentialsLoginForm";

export default function LoginPage() {
  const { callbackUrl, authError, enabledProviders, siteUrl } =
    useAuthHealthCheck();
  const [showEmailLogin, setShowEmailLogin] = useState(false);

  function handleOAuthSignIn(provider: "google" | "kakao" | "naver") {
    if (!enabledProviders.includes(provider)) {
      toast.error("이 로그인 방식은 서버에 아직 설정되지 않았습니다.");
      return;
    }
    const base = siteUrl.replace(/\/$/, "");
    const target = callbackUrl.startsWith("/") ? callbackUrl : "/";
    void signIn(provider, {
      callbackUrl: `${base}${target}`,
      redirect: true,
    });
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-4 py-10">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <Logo
          size={36}
          showWordmark
          href="/"
          wordmarkClassName="text-xl font-bold tracking-tight text-foreground"
        />

        <div className="text-center">
          <p className="text-2xl font-bold leading-snug text-foreground sm:text-3xl">
            CoreDXI와 함께
          </p>
          <p className="text-2xl font-bold leading-snug text-foreground sm:text-3xl">
            비즈니스 혁신을 시작해 보세요!
          </p>
        </div>

        {authError && (
          <div className="w-full space-y-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            <p role="alert">{authError}</p>
            <p>
              <button
                type="button"
                onClick={() => {
                  window.location.href = "/api/auth/reset";
                }}
                className="font-medium underline underline-offset-2"
              >
                로그인 쿠키 초기화
              </button>
              {" · "}
              <a
                href="/api/auth/health"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline underline-offset-2"
              >
                서버 설정 확인
              </a>
            </p>
          </div>
        )}

        <Card className="w-full max-w-md border border-border shadow-md ring-0">
          <CardContent className="p-8 sm:p-10">
            <Tabs defaultValue="individual">
              <TabsList
                variant="line"
                className="mb-6 h-auto w-full rounded-none border-b border-border bg-transparent p-0"
              >
                <TabsTrigger
                  value="individual"
                  className="flex-1 rounded-none pb-3 text-sm font-medium text-muted-foreground data-active:font-bold data-active:text-foreground"
                >
                  개인 회원
                </TabsTrigger>
                <TabsTrigger
                  value="business"
                  className="flex-1 rounded-none pb-3 text-sm font-medium text-muted-foreground data-active:font-bold data-active:text-foreground"
                >
                  기업·사업자 회원
                  <Badge className="bg-teal-500 px-1.5 py-0.5 text-[10px] font-semibold lowercase text-white">
                    biz
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="individual" className="mt-0">
                <LoginSocialPanel
                  enabledProviders={enabledProviders}
                  onOAuthSignIn={handleOAuthSignIn}
                />
              </TabsContent>
              <TabsContent value="business" className="mt-0">
                <LoginSocialPanel
                  enabledProviders={enabledProviders}
                  onOAuthSignIn={handleOAuthSignIn}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          이미 CoreDXI 회원이신가요?{" "}
          <button
            type="button"
            onClick={() => setShowEmailLogin((v) => !v)}
            className="font-medium text-foreground underline underline-offset-2 hover:text-black dark:hover:text-white"
          >
            로그인
          </button>
        </p>

        {showEmailLogin && (
          <UserCredentialsLoginForm callbackUrl={callbackUrl} />
        )}

        <p className="text-center text-xs text-muted-foreground">
          <Link
            href="/admin/login"
            className="font-medium hover:underline hover:underline-offset-4"
          >
            관리자 로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
