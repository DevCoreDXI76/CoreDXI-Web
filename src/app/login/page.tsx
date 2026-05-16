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
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { LoginSocialPanel } from "@/components/login/LoginSocialPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();

  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [callbackUrl, setCallbackUrl] = useState("/");
  const [authError, setAuthError] = useState<string | null>(null);

  const [loginStep, setLoginStep] = useState<"email" | "password">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailChecking, setIsEmailChecking] = useState(false);
  const [isUserPending, setIsUserPending] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const nextCallback = params.get("callbackUrl");
    if (nextCallback?.startsWith("/")) {
      setCallbackUrl(nextCallback);
    }
    const error = params.get("error");
    if (error === "Configuration") {
      setAuthError(
        "로그인 설정 오류입니다. Vercel Production에 AUTH_SECRET과 AUTH_URL(https://www.coredxi.com)이 설정되어 있는지 확인해 주세요."
      );
    } else if (error) {
      setAuthError("로그인에 실패했습니다. 다시 시도해 주세요.");
    }

    void fetch("/api/auth/health")
      .then((res) => res.json())
      .then(
        (data: {
          ok?: boolean;
          hasAuthSecret?: boolean;
          hasAuthUrl?: boolean;
          authUrl?: string | null;
        }) => {
          if (data.ok) return;
          if (!data.hasAuthSecret) {
            setAuthError(
              "서버에 AUTH_SECRET이 없습니다. Vercel → Settings → Environment Variables → Production에 AUTH_SECRET을 추가한 뒤 Redeploy 하세요."
            );
          } else if (!data.hasAuthUrl) {
            setAuthError(
              "서버에 AUTH_URL이 없습니다. Vercel Production에 AUTH_URL=https://www.coredxi.com 을 설정하세요."
            );
          }
        }
      )
      .catch(() => {
        /* ignore */
      });
  }, []);

  function handleOAuthSignIn(provider: "google" | "kakao" | "naver") {
    void signIn(provider, { callbackUrl: "/", redirect: true });
  }

  const isValidEmail = email.includes("@") && email.includes(".");
  const isUserFormValid = password.trim().length > 0;

  function goToSignup(trimmed: string) {
    router.push(`/signup?email=${encodeURIComponent(trimmed)}`);
  }

  function backToEmailStep() {
    setLoginStep("email");
    setPassword("");
    setShowPassword(false);
  }

  async function handleEmailContinue() {
    const trimmed = email.trim();
    if (!trimmed.includes("@") || !trimmed.includes(".") || isEmailChecking) {
      return;
    }

    setIsEmailChecking(true);
    try {
      const res = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message ?? "이메일 확인에 실패했습니다.");
        return;
      }

      if (data.exists && data.hasPassword) {
        setLoginStep("password");
        return;
      }

      goToSignup(trimmed);
    } catch {
      toast.error("이메일 확인 중 오류가 발생했습니다.");
    } finally {
      setIsEmailChecking(false);
    }
  }

  async function handleUserLogin() {
    const trimmed = email.trim();
    if (!isUserFormValid || isUserPending) return;

    setIsUserPending(true);
    try {
      const result = await signIn("user-credentials", {
        email: trimmed,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("이메일 또는 비밀번호가 올바르지 않습니다.");
        return;
      }

      toast.success("로그인되었습니다.");
      router.push(callbackUrl);
      router.refresh();
    } finally {
      setIsUserPending(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-white px-4 py-10">
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
          <div className="w-full space-y-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
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

        <Card className="w-full max-w-md border border-gray-200 shadow-md ring-0">
          <CardContent className="p-8 sm:p-10">
            <Tabs defaultValue="individual">
              <TabsList
                variant="line"
                className="mb-6 h-auto w-full rounded-none border-b border-gray-200 bg-transparent p-0"
              >
                <TabsTrigger
                  value="individual"
                  className="flex-1 rounded-none pb-3 text-sm font-medium text-gray-500 data-active:font-bold data-active:text-foreground"
                >
                  개인 회원
                </TabsTrigger>
                <TabsTrigger
                  value="business"
                  className="flex-1 rounded-none pb-3 text-sm font-medium text-gray-500 data-active:font-bold data-active:text-foreground"
                >
                  기업·사업자 회원
                  <Badge className="bg-teal-500 px-1.5 py-0.5 text-[10px] font-semibold lowercase text-white">
                    biz
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="individual" className="mt-0">
                <LoginSocialPanel onOAuthSignIn={handleOAuthSignIn} />
              </TabsContent>
              <TabsContent value="business" className="mt-0">
                <LoginSocialPanel onOAuthSignIn={handleOAuthSignIn} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-500">
          이미 CoreDXI 회원이신가요?{" "}
          <button
            type="button"
            onClick={() => setShowEmailLogin((v) => !v)}
            className="font-medium text-gray-700 underline underline-offset-2 hover:text-black"
          >
            로그인
          </button>
        </p>

        {showEmailLogin && (
          <Card className="w-full max-w-md border border-gray-200 shadow-sm ring-0">
            <CardContent className="space-y-4 p-6">
              {loginStep === "email" ? (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="login-email" className="text-sm font-medium">
                      이메일
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="rounded-md border-gray-300"
                      autoComplete="email"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && isValidEmail) {
                          void handleEmailContinue();
                        }
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    disabled={!isValidEmail || isEmailChecking}
                    className="w-full rounded-md bg-primary font-semibold text-white hover:bg-primary/90 disabled:opacity-40"
                    onClick={() => void handleEmailContinue()}
                  >
                    {isEmailChecking ? "확인 중…" : "Continue"}
                  </Button>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="login-email-readonly"
                      className="text-sm font-medium"
                    >
                      이메일
                    </Label>
                    <div className="relative">
                      <Input
                        id="login-email-readonly"
                        type="email"
                        value={email}
                        readOnly
                        className="rounded-md border-gray-300 bg-gray-50 pr-10"
                      />
                      <button
                        type="button"
                        onClick={backToEmailStep}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900"
                        aria-label="이메일 수정"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="user-password"
                      className="text-sm font-medium"
                    >
                      비밀번호
                    </Label>
                    <div className="relative">
                      <Input
                        id="user-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="비밀번호 입력"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isUserPending}
                        className="rounded-md border-gray-300 pr-10"
                        autoComplete="current-password"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && isUserFormValid) {
                            void handleUserLogin();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900"
                        aria-label={
                          showPassword ? "비밀번호 숨기기" : "비밀번호 표시"
                        }
                      >
                        {showPassword ? (
                          <EyeOffIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="button"
                    disabled={!isUserFormValid || isUserPending}
                    className="w-full rounded-md bg-primary font-semibold text-white hover:bg-primary/90 disabled:opacity-40"
                    onClick={() => void handleUserLogin()}
                  >
                    {isUserPending ? "로그인 중…" : "로그인"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
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
