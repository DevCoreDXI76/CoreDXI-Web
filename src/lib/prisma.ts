/**
 * src/lib/prisma.ts — Prisma 클라이언트 싱글턴
 *
 * Prisma 7.x는 드라이버 어댑터(@prisma/adapter-pg)가 필수입니다.
 * Next.js HMR 환경에서 DB 연결 중복을 막기 위해 globalThis에 캐싱합니다.
 * Vercel 등 서버리스에서는 동일 인스턴스에서 Pool을 재사용하고, 연결 수를 제한합니다.
 *
 * DATABASE_URL: Supabase pgbouncer 커넥션 풀링 URL (런타임 쿼리용, 포트 6543)
 *
 * ── 변경 이력 ──────────────────────────────────────────────────────
 * v0.3  2026-05-14  서버리스용 Pool 옵션, 프로덕션 global 캐시
 * v0.2  2026-05-14  Prisma 7.x + @prisma/adapter-pg 방식으로 전환
 * v0.1  2026-05-14  최초 생성
 * ────────────────────────────────────────────────────────────────────
 */

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
// Prisma 7.x: index.ts가 없으므로 client.ts를 직접 임포트합니다.
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL 환경 변수가 없습니다. Vercel 프로젝트 Settings → Environment Variables에 추가해 주세요."
    );
  }

  const pool = new Pool({
    connectionString,
    max: process.env.VERCEL ? 1 : 10,
    idleTimeoutMillis: process.env.VERCEL ? 20_000 : 30_000,
    connectionTimeoutMillis: 15_000,
    ssl: { rejectUnauthorized: false },
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}
