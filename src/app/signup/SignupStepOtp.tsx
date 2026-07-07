import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SIGNUP_CONTENT } from "./content";
import type { useSignupFlow } from "./useSignupFlow";

type Props = Pick<
  ReturnType<typeof useSignupFlow>,
  | "email"
  | "otp"
  | "otpRefs"
  | "otpError"
  | "isOtpComplete"
  | "verifyPending"
  | "sendPending"
  | "handleOtpChange"
  | "handleOtpKeyDown"
  | "handleVerifyOtp"
  | "handleSendOtp"
>;

export function SignupStepOtp({
  email,
  otp,
  otpRefs,
  otpError,
  isOtpComplete,
  verifyPending,
  sendPending,
  handleOtpChange,
  handleOtpKeyDown,
  handleVerifyOtp,
  handleSendOtp,
}: Props) {
  return (
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

        {otpError ? (
          <p className="text-center text-sm text-red-600" role="alert">
            {otpError}
          </p>
        ) : null}

        <Button
          type="button"
          disabled={!isOtpComplete || verifyPending}
          className="w-full rounded-lg bg-primary font-semibold"
          onClick={() => void handleVerifyOtp()}
        >
          {verifyPending ? "확인 중…" : SIGNUP_CONTENT.confirmOtp}
        </Button>

        <p className="text-center text-sm text-gray-500">
          {SIGNUP_CONTENT.resendText}{" "}
          <button
            type="button"
            disabled={sendPending}
            className="font-medium text-primary hover:underline disabled:opacity-50"
            onClick={() => void handleSendOtp()}
          >
            {sendPending ? "발송 중…" : SIGNUP_CONTENT.resendLink}
          </button>
        </p>
      </div>
    </>
  );
}
