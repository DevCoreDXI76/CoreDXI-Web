import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SIGNUP_CONTENT } from "./content";
import type { useSignupFlow } from "./useSignupFlow";

type Props = Pick<
  ReturnType<typeof useSignupFlow>,
  | "email"
  | "name"
  | "setName"
  | "password"
  | "setPassword"
  | "canComplete"
  | "pending"
  | "handleComplete"
>;

export function SignupStepProfile({
  email,
  name,
  setName,
  password,
  setPassword,
  canComplete,
  pending,
  handleComplete,
}: Props) {
  return (
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
          <Input value={email} readOnly className="rounded-lg bg-gray-50" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="signup-name">{SIGNUP_CONTENT.fullNameLabel}</Label>
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
  );
}
