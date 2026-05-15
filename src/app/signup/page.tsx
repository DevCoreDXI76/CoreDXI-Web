/**
 * signup/page.tsx — Loom 스타일 3단계 회원가입 (/signup)
 */

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SIGNUP_CONTENT = {
  step1Title: "첫 CoreDXI를 몇 초 만에 시작하세요",
  workEmailLabel: "업무용 이메일",
  googleButton: "Google 계정으로 등록",
  orLabel: "또는",
  continueText: "계속",
  step2Title: "코드를 이메일로 보냈습니다",
  step2Desc: "설정을 완료하려면 다음 주소로 보내드린 코드를 입력하세요.",
  confirmOtp: "확인",
  resendText: "이메일을 받지 못하셨습니까?",
  resendLink: "이메일 다시 보내기",
  step3Title: "이름이 무엇입니까?",
  step3Desc: "프로필에 표시될 이름입니다.",
  fullNameLabel: "전체 이름",
  fullNamePlaceholder: "이름을 입력하세요",
  passwordLabel: "비밀번호",
  passwordPlaceholder: "비밀번호를 입력하세요",
  passwordHint: "비밀번호는 최소 8자여야 합니다.",
  loginPrompt: "이미 계정이 있습니까?",
  loginLink: "로그인",
  terms:
    "가입하면 CoreDXI 이용 약관에 동의하고 개인정보 보호정책을 인정한 것으로 간주됩니다.",
} as const;

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

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const isEmailValid = email.includes("@") && email.includes(".");
  const isOtpComplete = otp.join("").length === 6;
  const canComplete = name.trim().length > 0 && password.length >= 8;

  function handleOtpChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  async function handleComplete() {
    if (!canComplete || pending) return;
    setPending(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: name.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message ?? "회원가입에 실패했습니다.");
        return;
      }

      const signInResult = await signIn("user-credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        toast.success("가입이 완료되었습니다. 로그인해 주세요.");
        router.push("/login");
        return;
      }

      toast.success("가입이 완료되었습니다.");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("회원가입 중 오류가 발생했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-violet-100/80 via-indigo-50 to-sky-100/80">
      <header className="px-6 py-5">
        <Link
          href="/"
          className="flex items-center gap-2.5"
          aria-label="CoreDXI 홈"
        >
          <svg
            width="30"
            height="30"
            viewBox="0 0 34 34"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M28.5 10.5C26.2 6.8 22.1 4.5 17 4.5C9.5 4.5 3.5 10.5 3.5 17C3.5 23.5 9.5 29.5 17 29.5C22.1 29.5 26.2 27.2 28.5 23.5"
              stroke="#1E4E8C"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-lg font-bold text-primary">CoreDXI</span>
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
          {step === 1 && (
            <>
              {/* [홍보팀] Step 1 제목·Google 버튼·이메일 라벨 문구는 SIGNUP_CONTENT에서 수정하세요. */}
              <h1 className="text-center text-xl font-bold text-gray-900">
                {SIGNUP_CONTENT.step1Title}
              </h1>
              <div className="mt-6 space-y-4">
                <button
                  type="button"
                  onClick={() => void signIn("google", { callbackUrl: "/" })}
                  className="flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium transition hover:bg-gray-100"
                >
                  <GoogleIcon className="h-5 w-5 shrink-0" />
                  <span className="flex-1 text-center">
                    {SIGNUP_CONTENT.googleButton}
                  </span>
                </button>

                <OrDivider />

                <div className="space-y-1.5">
                  <Label htmlFor="signup-email">
                    {SIGNUP_CONTENT.workEmailLabel}
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-lg"
                    autoComplete="email"
                  />
                </div>

                <Button
                  type="button"
                  disabled={!isEmailValid}
                  className="w-full rounded-lg bg-primary font-semibold"
                  onClick={() => setStep(2)}
                >
                  {SIGNUP_CONTENT.continueText}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  {SIGNUP_CONTENT.terms}
                </p>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              {/* [홍보팀] Step 2 OTP 안내 문구는 SIGNUP_CONTENT.step2Title / step2Desc에서 수정하세요. */}
              <h1 className="text-center text-xl font-bold text-gray-900">
                {SIGNUP_CONTENT.step2Title}
              </h1>
              <p className="mt-2 text-center text-sm text-gray-500">
                {SIGNUP_CONTENT.step2Desc}
              </p>
              <p className="mt-1 text-center text-sm font-semibold text-gray-900">
                {email}
              </p>
              <div className="mt-6 space-y-6">
                <div className="flex justify-center gap-2">
                  {otp.map((digit, i) => (
                    <Input
                      key={i}
                      ref={(el) => {
                        otpRefs.current[i] = el;
                      }}
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="h-12 w-11 rounded-lg border-gray-300 text-center text-lg font-semibold"
                    />
                  ))}
                </div>

                <Button
                  type="button"
                  disabled={!isOtpComplete}
                  className="w-full rounded-lg bg-primary font-semibold"
                  onClick={() => setStep(3)}
                >
                  {SIGNUP_CONTENT.confirmOtp}
                </Button>

                <p className="text-center text-sm text-gray-500">
                  {SIGNUP_CONTENT.resendText}{" "}
                  <button
                    type="button"
                    className="font-medium text-primary hover:underline"
                    onClick={() =>
                      toast.info("인증 메일을 다시 보냈습니다. (Mock)")
                    }
                  >
                    {SIGNUP_CONTENT.resendLink}
                  </button>
                </p>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              {/* [홍보팀] Step 3 이름·비밀번호 라벨은 SIGNUP_CONTENT.step3Title 등에서 수정하세요. */}
              <h1 className="text-center text-xl font-bold text-gray-900">
                {SIGNUP_CONTENT.step3Title}
              </h1>
              <p className="mt-1 text-center text-sm text-gray-500">
                {SIGNUP_CONTENT.step3Desc}
              </p>
              <div className="mt-6 space-y-4">
                <div className="space-y-1.5">
                  <Label>{SIGNUP_CONTENT.workEmailLabel}</Label>
                  <Input
                    value={email}
                    readOnly
                    className="rounded-lg bg-gray-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="signup-name">
                    {SIGNUP_CONTENT.fullNameLabel}
                  </Label>
                  <Input
                    id="signup-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={SIGNUP_CONTENT.fullNamePlaceholder}
                    className="rounded-lg"
                    autoComplete="name"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="signup-password">
                    {SIGNUP_CONTENT.passwordLabel}
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={SIGNUP_CONTENT.passwordPlaceholder}
                    className="rounded-lg"
                    autoComplete="new-password"
                  />
                  <p className="text-xs text-muted-foreground">
                    {SIGNUP_CONTENT.passwordHint}
                  </p>
                </div>

                <Button
                  type="button"
                  disabled={!canComplete || pending}
                  className="w-full rounded-lg bg-primary font-semibold"
                  onClick={() => void handleComplete()}
                >
                  {pending ? "처리 중…" : SIGNUP_CONTENT.continueText}
                </Button>
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="pb-8 text-center text-sm text-muted-foreground">
        {SIGNUP_CONTENT.loginPrompt}{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          {SIGNUP_CONTENT.loginLink}
        </Link>
      </footer>
    </div>
  );
}

function OrDivider() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-gray-200" />
      <span className="text-xs text-gray-400">{SIGNUP_CONTENT.orLabel}</span>
      <div className="h-px flex-1 bg-gray-200" />
    </div>
  );
}
