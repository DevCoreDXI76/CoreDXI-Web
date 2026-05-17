/**
 * NextAuth API 라우트 — 핸들러는 @/auth 에서 export.
 * Provider·profile 매핑: src/auth.config.ts (Kakao/Naver → lib/auth/*-profile.ts), src/auth.ts
 */
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
