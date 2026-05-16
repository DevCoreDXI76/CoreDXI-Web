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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type MemberType = "individual" | "business";

const NOT_READY_MESSAGE =
  "현재 준비 중인 로그인 방식입니다. 구글, 카카오, 네이버를 이용해 주세요.";

function KakaoIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M12 3C6.48 3 2 6.58 2 10.9c0 2.78 1.86 5.22 4.64 6.6-.2.74-.72 2.69-.82 3.1-.13.52.19.51.4.37.17-.12 2.71-1.84 3.8-2.55.55.08 1.12.12 1.71.12 5.52 0 10-3.58 10-7.9S17.52 3 12 3z" />
    </svg>
  );
}

function NaverIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M16.273 12.845L7.376 0H0v24h7.727V11.156L16.624 24H24V0h-7.727v12.845z" />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

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

  const [memberType, setMemberType] = useState<MemberType>("individual");
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [callbackUrl, setCallbackUrl] = useState("/");

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
  }, []);

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

  function handleNotReady() {
    alert(NOT_READY_MESSAGE);
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

        <div className="w-full rounded-xl border border-gray-200 bg-white p-8 shadow-sm sm:p-10">
          <div className="mb-6 flex border-b border-gray-200">
            <button
              type="button"
              onClick={() => setMemberType("individual")}
              className={`flex flex-1 items-center justify-center pb-3 text-sm transition-colors ${
                memberType === "individual"
                  ? "border-b-2 border-black font-bold text-black"
                  : "font-medium text-gray-500"
              }`}
            >
              개인 회원
            </button>
            <button
              type="button"
              onClick={() => setMemberType("business")}
              className={`flex flex-1 items-center justify-center gap-1.5 pb-3 text-sm transition-colors ${
                memberType === "business"
                  ? "border-b-2 border-black font-bold text-black"
                  : "font-medium text-gray-500"
              }`}
            >
              기업·사업자 회원
              <span className="rounded bg-teal-500 px-1.5 py-0.5 text-[10px] font-semibold lowercase text-white">
                biz
              </span>
            </button>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => void signIn("kakao", { callbackUrl })}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#FEE500] text-sm font-semibold text-black transition-opacity hover:opacity-90"
            >
              <KakaoIcon className="h-5 w-5 shrink-0" />
              카카오로 시작하기
            </button>

            <button
              type="button"
              onClick={() => void signIn("naver", { callbackUrl })}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#03C75A] text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              <NaverIcon className="h-4 w-4 shrink-0" />
              네이버로 시작하기
            </button>

            <button
              type="button"
              onClick={() => router.push("/signup")}
              className="flex h-12 w-full items-center justify-center rounded-md border border-gray-300 bg-white text-sm font-semibold text-black transition-colors hover:bg-gray-50"
            >
              이메일로 시작하기
            </button>
          </div>

          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => void signIn("google", { callbackUrl })}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 bg-white transition-colors hover:bg-gray-50"
              aria-label="Google로 로그인"
            >
              <GoogleIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleNotReady}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-white transition-opacity hover:opacity-90"
              aria-label="Apple로 로그인"
            >
              <AppleIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleNotReady}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1877F2] text-white transition-opacity hover:opacity-90"
              aria-label="Facebook으로 로그인"
            >
              <FacebookIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

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
          <div className="w-full max-w-md space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
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
                  <Label htmlFor="user-password" className="text-sm font-medium">
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
          </div>
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
