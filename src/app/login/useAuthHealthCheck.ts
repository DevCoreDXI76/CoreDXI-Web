import { useEffect, useState } from "react";

type AuthHealthResponse = {
  ok?: boolean;
  hasAuthSecret?: boolean;
  hasAuthUrl?: boolean;
  hasDatabaseUrl?: boolean;
  authUrl?: string | null;
  providers?: Array<"google" | "kakao" | "naver">;
};

function authErrorMessage(data: AuthHealthResponse): string {
  if (!data.hasAuthSecret) {
    return "서버에 AUTH_SECRET이 없습니다. Vercel → Settings → Environment Variables → Production에 AUTH_SECRET을 추가한 뒤 Redeploy 하세요.";
  }
  if (!data.hasAuthUrl) {
    return "서버에 AUTH_URL이 없습니다. Vercel Production에 AUTH_URL=https://www.coredxi.com 을 설정하세요.";
  }
  if (!data.hasDatabaseUrl) {
    return "서버에 DATABASE_URL이 없습니다. Vercel Production 환경변수를 확인한 뒤 Redeploy 하세요.";
  }
  return "로그인 설정 오류입니다. Vercel Production 환경변수를 확인해 주세요.";
}

/**
 * 로그인 페이지 진입 시: apex→www 리다이렉트, URL의 callbackUrl/error 파라미터
 * 정리, /api/auth/health로 OAuth·AUTH_SECRET 등 서버 설정 진단을 수행한다.
 */
export function useAuthHealthCheck() {
  const [callbackUrl, setCallbackUrl] = useState("/");
  const [authError, setAuthError] = useState<string | null>(null);
  const [enabledProviders, setEnabledProviders] = useState<
    Array<"google" | "kakao" | "naver">
  >([]);
  const [siteUrl, setSiteUrl] = useState("https://www.coredxi.com");

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.location.hostname === "coredxi.com") {
      window.location.replace(
        `https://www.coredxi.com${window.location.pathname}${window.location.search}`
      );
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const nextCallback = params.get("callbackUrl");
    if (nextCallback?.startsWith("/")) {
      setCallbackUrl(nextCallback);
    }
    if (params.get("error")) {
      const clean = new URL(window.location.href);
      clean.searchParams.delete("error");
      clean.searchParams.delete("error_description");
      window.history.replaceState({}, "", clean.pathname + clean.search);
    }

    void fetch("/api/auth/health")
      .then((res) => res.json())
      .then((data: AuthHealthResponse) => {
        if (data.authUrl) {
          setSiteUrl(data.authUrl);
        }
        if (data.providers?.length) {
          setEnabledProviders(data.providers);
        }
        if (!data.ok) {
          setAuthError(authErrorMessage(data));
        }
      })
      .catch(() => {
        /* health 실패 시 UI 배너 없음 — 구글·카카오는 정상 동작 중 */
      });
  }, []);

  return { callbackUrl, authError, enabledProviders, siteUrl };
}
