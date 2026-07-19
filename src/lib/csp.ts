/**
 * CSP 정책 문자열 조립 — 값은 docs/superpowers/specs/2026-07-19-csp-design.md의
 * "CSP 정책" 표와 정확히 일치해야 한다.
 */
export function buildCsp(nonce: string): string {
  const directives: [string, string[]][] = [
    ["default-src", ["'self'"]],
    [
      "script-src",
      ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", "https:"],
    ],
    ["style-src", ["'self'", "'unsafe-inline'"]],
    ["img-src", ["'self'", "data:", "https:"]],
    ["font-src", ["'self'"]],
    [
      "connect-src",
      [
        "'self'",
        "https://www.google-analytics.com",
        "https://*.google-analytics.com",
        "https://www.googletagmanager.com",
      ],
    ],
    [
      "frame-src",
      ["'self'", "https://www.youtube.com", "https://player.vimeo.com"],
    ],
    ["form-action", ["'self'"]],
    ["frame-ancestors", ["'self'"]],
    ["object-src", ["'none'"]],
    ["base-uri", ["'self'"]],
  ];

  const policy = directives
    .map(([directive, values]) => `${directive} ${values.join(" ")}`)
    .join("; ");

  return `${policy}; report-uri /api/csp-report;`;
}
