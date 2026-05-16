/**
 * Vercel 등에서 빈 문자열("")로 저장된 env는 미설정과 동일하게 처리합니다.
 * AUTH_SECRET="" 이 있으면 NEXTAUTH_SECRET 폴백이 막혀 Configuration 오류가 납니다.
 *
 * AUTH_URL에 https:// 없이 "www.coredxi.com"만 넣으면 Auth.js가 Invalid URL을 냅니다.
 */
export function readEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return undefined;
}

/** "www.example.com" → "https://www.example.com" (origin만 반환) */
export function normalizeSiteUrl(raw: string | undefined): string | undefined {
  if (!raw?.trim()) return undefined;

  const trimmed = raw.trim().replace(/\/$/, "");
  try {
    const href = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    return new URL(href).origin;
  } catch {
    return undefined;
  }
}

export const authSecret = readEnv("AUTH_SECRET", "NEXTAUTH_SECRET");

/** Auth.js가 사용하는 공개 URL (AUTH_URL / NEXTAUTH_URL 정규화) */
export const authUrl = normalizeSiteUrl(
  readEnv("AUTH_URL", "NEXTAUTH_URL")
);

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
