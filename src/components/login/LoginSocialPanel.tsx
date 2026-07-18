"use client";

import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FaApple, FaFacebook } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

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

type OAuthProviderId = "google" | "kakao" | "naver";

type LoginSocialPanelProps = {
  enabledProviders: OAuthProviderId[];
  onOAuthSignIn: (provider: OAuthProviderId) => void;
};

export function LoginSocialPanel({
  enabledProviders,
  onOAuthSignIn,
}: LoginSocialPanelProps) {
  const router = useRouter();

  const canKakao = enabledProviders.includes("kakao");
  const canNaver = enabledProviders.includes("naver");
  const canGoogle = enabledProviders.includes("google");

  function handleNotReady() {
    alert(NOT_READY_MESSAGE);
  }

  function handleProviderClick(provider: OAuthProviderId) {
    if (!enabledProviders.includes(provider)) {
      if (provider === "naver") {
        alert(
          "네이버 로그인은 Vercel에 NAVER_CLIENT_ID / NAVER_CLIENT_SECRET 설정과\n네이버 개발자 콘솔 Callback URL\n(https://www.coredxi.com/api/auth/callback/naver) 등록이 필요합니다."
        );
        return;
      }
      alert(NOT_READY_MESSAGE);
      return;
    }
    onOAuthSignIn(provider);
  }

  return (
    <>
      <div className="space-y-3">
        <Button
          type="button"
          disabled={!canKakao}
          onClick={() => handleProviderClick("kakao")}
          className={cn(
            "h-12 w-full rounded-md border-transparent text-sm font-semibold text-black shadow-none",
            "bg-[#FEE500] hover:bg-[#FEE500]/90 hover:text-black",
            !canKakao && "cursor-not-allowed opacity-50"
          )}
        >
          <KakaoIcon className="h-5 w-5 shrink-0" />
          카카오로 시작하기
        </Button>

        <Button
          type="button"
          onClick={() => handleProviderClick("naver")}
          className={cn(
            "h-12 w-full rounded-md border-transparent text-sm font-semibold text-white shadow-none",
            "bg-[#03C75A] hover:bg-[#03C75A]/90 hover:text-white",
            !canNaver && "opacity-70"
          )}
        >
          <NaverIcon className="h-4 w-4 shrink-0" />
          네이버로 시작하기
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/signup")}
          className="h-12 w-full rounded-md text-sm font-semibold"
        >
          이메일로 시작하기
        </Button>
      </div>

      <Separator className="my-6" />

      <div className="flex justify-center gap-3">
        <button
          type="button"
          disabled={!canGoogle}
          onClick={() => handleProviderClick("google")}
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-muted",
            !canGoogle && "cursor-not-allowed opacity-50"
          )}
          aria-label="Google로 로그인"
        >
          <FcGoogle className="h-6 w-6" />
        </button>
        <button
          type="button"
          onClick={handleNotReady}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-white transition-opacity hover:opacity-90"
          aria-label="Apple로 로그인"
        >
          <FaApple className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={handleNotReady}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1877F2] text-white transition-opacity hover:opacity-90"
          aria-label="Facebook으로 로그인"
        >
          <FaFacebook className="h-5 w-5" />
        </button>
      </div>
    </>
  );
}
