/**
 * 네이버 로그인 사용자 정보 API 응답 구조
 * @see https://developers.naver.com/docs/login/profile/profile.md
 */
export type NaverProfile = {
  response: {
    id: string;
    name?: string;
    nickname?: string;
    email?: string;
    profile_image?: string;
  };
};

/** 이메일 미제공 시 Prisma User.email용 가상 주소 */
export function naverFallbackEmail(naverId: string): string {
  return `naver_${naverId}@coredxi.placeholder.com`;
}

/** NextAuth NaverProvider profile() → User 필드 매핑 */
export function mapNaverProfile(profile: unknown) {
  const res = (profile as NaverProfile).response;
  const email = res?.email?.trim();

  return {
    id: res.id,
    name: res?.name ?? res?.nickname ?? "네이버 사용자",
    email: email || naverFallbackEmail(res.id),
    image: res?.profile_image ?? null,
  };
}
