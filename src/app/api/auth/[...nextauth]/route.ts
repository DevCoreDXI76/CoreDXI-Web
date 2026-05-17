/**
 * NextAuth API 라우트 — 핸들러는 @/auth 에서 export.
 * Provider·콜백·Kakao profile 매핑: src/auth.config.ts, src/auth.ts
 */
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
