import { checkRateLimit, recordRateLimitHit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/client-ip";

const WINDOW_MS = 15 * 60 * 1000;

export type UserLoginRateLimitCheck =
  | { allowed: true; recordFailure: () => Promise<void> }
  | { allowed: false };

/**
 * 일반 회원 로그인 시도가 이메일·IP rate limit을 넘지 않았는지 판정한다.
 * 판정만 하고 카운트는 소비하지 않으며(recordOnAllowed: false), 실패가
 * 확정된 시점에 반환된 recordFailure()를 호출해야 두 키 모두 기록된다.
 * 로그인이 성공하면 recordFailure()를 호출하지 않으면 되고, 그러면 그
 * 시도는 카운트에 반영되지 않는다.
 */
export async function checkUserLoginRateLimit(
  email: string
): Promise<UserLoginRateLimitCheck> {
  const normalizedEmail = email.trim().toLowerCase();
  const clientIp = await getClientIp();
  const emailKey = `user-login:${normalizedEmail}`;
  const ipKey = `user-login-ip:${clientIp}`;

  const emailLimit = await checkRateLimit(emailKey, {
    max: 5,
    windowMs: WINDOW_MS,
    recordOnAllowed: false,
  });
  if (!emailLimit.allowed) return { allowed: false };

  const ipLimit = await checkRateLimit(ipKey, {
    max: 20,
    windowMs: WINDOW_MS,
    recordOnAllowed: false,
  });
  if (!ipLimit.allowed) return { allowed: false };

  return {
    allowed: true,
    recordFailure: async () => {
      await Promise.all([
        recordRateLimitHit(emailKey),
        recordRateLimitHit(ipKey),
      ]);
    },
  };
}
