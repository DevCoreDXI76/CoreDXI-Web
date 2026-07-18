import { prisma } from "@/lib/prisma";

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

/**
 * DB(Prisma) 기반 슬라이딩 윈도우 rate limit. Vercel 서버리스 환경에서
 * 인스턴스 간 공유되는 상태가 필요해 인메모리 대신 RateLimitHit 테이블을 사용한다.
 */
export async function checkRateLimit(
  key: string,
  {
    max,
    windowMs,
    recordOnAllowed = true,
  }: { max: number; windowMs: number; recordOnAllowed?: boolean }
): Promise<RateLimitResult> {
  const windowStart = new Date(Date.now() - windowMs);

  await prisma.rateLimitHit.deleteMany({
    where: { key, createdAt: { lt: windowStart } },
  });

  const count = await prisma.rateLimitHit.count({
    where: { key, createdAt: { gte: windowStart } },
  });

  if (count >= max) {
    const oldestInWindow = await prisma.rateLimitHit.findFirst({
      where: { key, createdAt: { gte: windowStart } },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    });
    const retryAfterMs = oldestInWindow
      ? oldestInWindow.createdAt.getTime() + windowMs - Date.now()
      : windowMs;
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    };
  }

  if (recordOnAllowed) {
    await prisma.rateLimitHit.create({ data: { key } });
  }
  return { allowed: true };
}

/**
 * 판정은 checkRateLimit(recordOnAllowed: false)로 미리 해두고, 실패가
 * 확정된 시점에만 히트를 기록하고 싶을 때 쓴다 (예: 로그인 성공 시도는
 * 카운트에서 빼고 실패 시도만 카운트하는 경우).
 */
export async function recordRateLimitHit(key: string): Promise<void> {
  await prisma.rateLimitHit.create({ data: { key } });
}
