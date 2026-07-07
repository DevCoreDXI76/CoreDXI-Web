import { headers } from "next/headers";

/** Vercel/프록시 환경에서 클라이언트 IP를 추출한다 (rate limit 키용). */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwardedFor = h.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]!.trim();
  }
  return h.get("x-real-ip") ?? "unknown";
}
