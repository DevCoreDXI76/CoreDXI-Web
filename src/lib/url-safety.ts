/** 사설/루프백/링크로컬 대역 호스트인지 확인 — 서버 사이드 외부 URL fetch 시 SSRF 방지용 */
export function isBlockedHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return (
    h === "localhost" ||
    h === "127.0.0.1" ||
    h === "::1" ||
    h.startsWith("192.168.") ||
    h.startsWith("10.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(h) ||
    h.endsWith(".internal") ||
    h.endsWith(".local")
  );
}
