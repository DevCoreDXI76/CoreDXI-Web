/**
 * src/lib/prisma.ts — Prisma 클라이언트 싱글턴
 *
 * Prisma 7.x는 드라이버 어댑터(@prisma/adapter-pg)가 필수입니다.
 * Next.js HMR 환경에서 DB 연결 중복을 막기 위해 globalThis에 캐싱합니다.
 *
 * DATABASE_URL: Supabase pgbouncer 커넥션 풀링 URL (런타임 쿼리용, 포트 6543)
 *
 * ── 변경 이력 ──────────────────────────────────────────────────────
 * v0.2  2026-05-14  Prisma 7.x + @prisma/adapter-pg 방식으로 전환
 * v0.1  2026-05-14  최초 생성
 * ────────────────────────────────────────────────────────────────────
 */

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
// Prisma 7.x: index.ts가 없으므로 client.ts를 직접 임포트합니다.
import { PrismaClient } from "@/generated/prisma/client";

// globalThis를 사용해 개발 환경에서 HMR로 인한 중복 연결 방지
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  // pg Pool: Supabase pgbouncer를 통한 커넥션 풀링
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
