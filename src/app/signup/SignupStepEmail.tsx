import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleIcon } from "@/components/signup/GoogleIcon";
import { SIGNUP_CONTENT } from "./content";
import type { useSignupFlow } from "./useSignupFlow";

type Props = Pick<
  ReturnType<typeof useSignupFlow>,
  "email" | "setEmail" | "isEmailValid" | "sendPending" | "handleSendOtp"
>;

function OrDivider() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-gray-200" />
      <span className="text-xs text-gray-400">{SIGNUP_CONTENT.orLabel}</span>
      <div className="h-px flex-1 bg-gray-200" />
    </div>
  );
}

export function SignupStepEmail({
  email,
  setEmail,
  isEmailValid,
  sendPending,
  handleSendOtp,
}: Props) {
  return (
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
          <Label htmlFor="signup-email">{SIGNUP_CONTENT.workEmailLabel}</Label>
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
          disabled={!isEmailValid || sendPending}
          className="w-full rounded-lg bg-primary font-semibold"
          onClick={() => void handleSendOtp()}
        >
          {sendPending ? "발송 중…" : SIGNUP_CONTENT.continueText}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          {SIGNUP_CONTENT.terms}
        </p>
      </div>
    </>
  );
}
