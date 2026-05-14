/**
 * src/lib/prisma.ts — Prisma 클라이언트 싱글턴
 *
 * Next.js 개발 서버는 파일 변경 시 모듈을 재로드(HMR)합니다.
 * 매번 새 PrismaClient를 생성하면 DB 연결이 과도하게 늘어나므로,
 * globalThis에 인스턴스를 캐싱하여 하나만 유지합니다.
 *
 * 프로덕션 환경(NODE_ENV=production)에서는 globalThis 캐싱을 건너뜁니다.
 *
 * ── 변경 이력 ──────────────────────────────────────────────────────
 * v0.1  2026-05-14  최초 생성
 *       - Prisma 7.x (@/generated/prisma) 싱글턴 패턴
 * ────────────────────────────────────────────────────────────────────
 */

import { PrismaClient } from "@/generated/prisma";

// globalThis를 사용해 개발 환경에서 HMR로 인한 중복 연결 방지
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Prisma 7.x: schema.prisma에 url이 없으므로 datasourceUrl로 직접 연결 URL 전달
// DATABASE_URL: Supabase pgbouncer 커넥션 풀링 URL (런타임 쿼리용)
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
