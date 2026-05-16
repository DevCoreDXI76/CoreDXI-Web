/**
 * Auth.js / NextAuth 환경변수 정규화
 *
 * - 빈 문자열("") → 미설정 처리
 * - Vercel 값에 따옴표가 포함된 경우 제거
 * - AUTH_URL / NEXTAUTH_URL / AUTH_SECRET / NEXTAUTH_SECRET 을 항상 동일 값으로 통일
 * - 프로덕션(Vercel)에서 URL 미설정 시 https://www.coredxi.com 사용
 */
const PRODUCTION_SITE_URL = "https://www.coredxi.com";

function stripQuotes(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

export function readEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const raw = process.env[key];
    if (!raw) continue;
    const value = stripQuotes(raw);
    if (value) return value;
  }
  return undefined;
}

/** "www.example.com" → "https://www.example.com" */
export function normalizeSiteUrl(raw: string | undefined): string | undefined {
  if (!raw) return undefined;

  const trimmed = stripQuotes(raw).replace(/\/$/, "");
  if (!trimmed) return undefined;

  try {
    const href = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    return new URL(href).origin;
  } catch {
    return undefined;
  }
}

function resolveAuthUrl(): string | undefined {
  const fromEnv = normalizeSiteUrl(
    readEnv("AUTH_URL", "NEXTAUTH_URL")
  );
  if (fromEnv) return fromEnv;

  const vercelHost = readEnv("VERCEL_URL");
  if (vercelHost) {
    const fromVercel = normalizeSiteUrl(vercelHost);
    if (fromVercel) return fromVercel;
  }

  if (process.env.VERCEL === "1" || process.env.NODE_ENV === "production") {
    return PRODUCTION_SITE_URL;
  }

  return undefined;
}

function resolveAuthSecret(): string | undefined {
  return readEnv("AUTH_SECRET", "NEXTAUTH_SECRET");
}

const resolvedAuthUrl = resolveAuthUrl();
const resolvedAuthSecret = resolveAuthSecret();

if (resolvedAuthUrl) {
  process.env.AUTH_URL = resolvedAuthUrl;
  process.env.NEXTAUTH_URL = resolvedAuthUrl;
}

if (resolvedAuthSecret) {
  process.env.AUTH_SECRET = resolvedAuthSecret;
  process.env.NEXTAUTH_SECRET = resolvedAuthSecret;
} else if (process.env.VERCEL === "1" || process.env.NODE_ENV === "production") {
  console.error(
    "[auth] AUTH_SECRET(또는 NEXTAUTH_SECRET)이 없습니다. Vercel Production 환경변수를 설정하세요."
  );
}

export const authUrl = resolvedAuthUrl;
export const authSecret = resolvedAuthSecret;

export const googleClientId = readEnv("GOOGLE_CLIENT_ID", "AUTH_GOOGLE_ID");
export const googleClientSecret = readEnv(
  "GOOGLE_CLIENT_SECRET",
  "AUTH_GOOGLE_SECRET"
);

export const kakaoClientId = readEnv("KAKAO_CLIENT_ID", "AUTH_KAKAO_ID");
export const kakaoClientSecret = readEnv(
  "KAKAO_CLIENT_SECRET",
  "AUTH_KAKAO_SECRET"
);

export const naverClientId = readEnv("NAVER_CLIENT_ID", "AUTH_NAVER_ID");
export const naverClientSecret = readEnv(
  "NAVER_CLIENT_SECRET",
  "AUTH_NAVER_SECRET"
);
