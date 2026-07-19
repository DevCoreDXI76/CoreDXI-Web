/**
 * signup/page.tsx — Loom 스타일 3단계 회원가입 (/signup)
 */

"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Suspense } from "react";
import { SIGNUP_CONTENT } from "./content";
import { useSignupFlow } from "./useSignupFlow";
import { SignupStepEmail } from "./SignupStepEmail";
import { SignupStepOtp } from "./SignupStepOtp";
import { SignupStepProfile } from "./SignupStepProfile";

export default function SignupPage() {
  return (
    <Suspense>
      <SignupPageContent />
    </Suspense>
  );
}

function SignupPageContent() {
  const flow = useSignupFlow();

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-violet-100/80 via-indigo-50 to-sky-100/80 dark:from-violet-950/40 dark:via-background dark:to-sky-950/30">
      <header className="px-6 py-5">
        <Logo
          size={30}
          showWordmark
          ariaLabel="CoreDXI 홈"
          wordmarkClassName="text-lg font-bold text-primary"
        />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-xl">
          {flow.step === 1 && (
            <SignupStepEmail
              email={flow.email}
              setEmail={flow.setEmail}
              isEmailValid={flow.isEmailValid}
              sendPending={flow.sendPending}
              handleSendOtp={flow.handleSendOtp}
            />
          )}

          {flow.step === 2 && (
            <SignupStepOtp
              email={flow.email}
              otp={flow.otp}
              otpRefs={flow.otpRefs}
              otpError={flow.otpError}
              isOtpComplete={flow.isOtpComplete}
              verifyPending={flow.verifyPending}
              sendPending={flow.sendPending}
              handleOtpChange={flow.handleOtpChange}
              handleOtpKeyDown={flow.handleOtpKeyDown}
              handleVerifyOtp={flow.handleVerifyOtp}
              handleSendOtp={flow.handleSendOtp}
            />
          )}

          {flow.step === 3 && flow.emailOtpVerified && (
            <SignupStepProfile
              email={flow.email}
              name={flow.name}
              setName={flow.setName}
              password={flow.password}
              setPassword={flow.setPassword}
              canComplete={flow.canComplete}
              pending={flow.pending}
              handleComplete={flow.handleComplete}
            />
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
