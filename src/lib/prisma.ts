/**
 * src/lib/prisma.ts — Prisma 클라이언트 싱글턴
 *
 * Prisma 7.x + @prisma/adapter-pg 패턴.
 * Supabase pgbouncer(Supavisor)는 Supabase 자체 루트 CA로 서명된 인증서를 사용합니다.
 * 이 루트는 공인 트러스트 스토어에 없으므로, TLS 검증을 끄는 대신
 * `SUPABASE_CA_CERT`를 신뢰 CA로 추가해 정상적으로 인증서 검증을 수행합니다.
 */

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { SUPABASE_CA_CERT } from "@/lib/supabase-ca";

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
    ssl: { ca: SUPABASE_CA_CERT, rejectUnauthorized: true },
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}
