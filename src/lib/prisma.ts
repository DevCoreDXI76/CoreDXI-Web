/**
 * src/lib/prisma.ts — Prisma 클라이언트 싱글턴
 *
 * Prisma 7.x + @prisma/adapter-pg 패턴.
 * Supabase pgbouncer(자체 서명 인증서)에서 TLS 연결을 위해
 * Node.js 레벨 + pg 드라이버 레벨 양쪽에서 인증서 검증을 비활성화합니다.
 */

// Supabase pgbouncer 자체 서명 인증서 허용 (Node.js 전역)
if (process.env.NODE_ENV === "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
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
