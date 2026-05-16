/**
 * Vercel 등에서 빈 문자열("")로 저장된 env는 미설정과 동일하게 처리합니다.
 * AUTH_SECRET="" 이 있으면 NEXTAUTH_SECRET 폴백이 막혀 Configuration 오류가 납니다.
 */
export function readEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return undefined;
}

export const authSecret = readEnv("AUTH_SECRET", "NEXTAUTH_SECRET");

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
