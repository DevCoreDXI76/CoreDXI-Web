/**
 * format-kst-date.ts — 한국 시간(KST) 날짜·시간 포맷 유틸
 *
 * 서버(Vercel 등)는 UTC로 동작하므로, 화면 표시 시 timeZone: Asia/Seoul을 명시합니다.
 */

const KST: Intl.DateTimeFormatOptions = { timeZone: "Asia/Seoul" };

export function formatKstDate(date: string | Date): string {
  const value = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("ko-KR", {
    ...KST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

export function formatKstDateLong(date: string | Date): string {
  const value = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("ko-KR", {
    ...KST,
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(value);
}

export function formatKstDateTime(date: string | Date): string {
  const value = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("ko-KR", {
    ...KST,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(value);
}
