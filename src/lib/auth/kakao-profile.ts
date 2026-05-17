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

/** NextAuth KakaoProvider profile() → User 필드 매핑 */
export function mapKakaoProfile(profile: unknown) {
  const p = profile as KakaoProfile;
  const ka = p.kakao_account;

  return {
    id: String(p.id),
    name: ka?.profile?.nickname ?? null,
    email: ka?.email ?? null,
    image: ka?.profile?.profile_image_url ?? null,
  };
}
