/**
 * 카카오 로그인 User API 응답 구조
 * @see https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api
 */
export type KakaoProfile = {
  id: number;
  kakao_account?: {
    email?: string;
    profile?: {
      nickname?: string;
      profile_image_url?: string;
    };
  };
};

/** 비즈니스 미인증 앱 등 이메일 미제공 시 Prisma User.email용 가상 주소 */
export function kakaoFallbackEmail(kakaoId: number | string): string {
  return `kakao_${kakaoId}@coredxi.placeholder.com`;
}

/** NextAuth KakaoProvider profile() → User 필드 매핑 */
export function mapKakaoProfile(profile: unknown) {
  const p = profile as KakaoProfile;
  const ka = p.kakao_account;
  const email = ka?.email?.trim();

  return {
    id: String(p.id),
    name: ka?.profile?.nickname ?? "카카오 사용자",
    email: email || kakaoFallbackEmail(p.id),
    image: ka?.profile?.profile_image_url ?? null,
  };
}
