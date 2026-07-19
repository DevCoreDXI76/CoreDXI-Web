# CSP(Content-Security-Policy) 도입 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Report-Only 모드로 nonce 기반 CSP를 도입하고, 위반 리포트를 Sentry로 수집하는 파이프라인을 구축한다.

**Architecture:** `src/middleware.ts`에서 요청마다 nonce를 생성해 `x-nonce` 요청 헤더로 전달하고 `Content-Security-Policy-Report-Only` 응답 헤더를 설정한다. CSP 문자열 조립은 순수 함수 `src/lib/csp.ts`의 `buildCsp(nonce)`로 분리해 유닛 테스트한다. `src/app/layout.tsx`는 `next/headers`로 nonce를 읽어 GA4 `<Script>`와 JSON-LD `<script>`에 적용한다. 위반 리포트는 `/api/csp-report` 라우트가 받아 `Sentry.captureMessage`로 로깅한다.

**Tech Stack:** Next.js 15.5.18 (App Router, Turbopack), next-auth 5.0.0-beta.31, Vitest 4.1.10 (`environment: "node"`, `include: ["src/**/*.test.ts"]`), Playwright 1.61.1, `@sentry/nextjs` 10.60.0.

## Global Constraints

- CSP 정책 값은 설계 문서(`docs/superpowers/specs/2026-07-19-csp-design.md`) 표와 정확히 일치해야 한다 — 임의로 directive를 추가/축소하지 않는다.
- Phase 1(Report-Only)만 구현한다. 헤더명은 `Content-Security-Policy-Report-Only`로 고정 — `Content-Security-Policy`(enforcing)로의 전환은 이 계획의 범위 밖(1주 프로덕션 모니터링 후 수동 전환, 설계 문서 §롤아웃 계획 Phase 3 참고).
- 기존 `src/middleware.ts`의 `/admin`, `/concepts` 인증/차단 로직은 동작을 변경하지 않는다 — CSP 헤더 추가만 얹는다.
- 테스트 파일은 소스 파일과 같은 디렉터리에 `*.test.ts`로 둔다(예: `src/lib/csp.ts` ↔ `src/lib/csp.test.ts`) — 이 저장소의 기존 관례.
- 신규 unit 테스트는 `describe`/`it`/`expect`(Vitest) 스타일을 따른다 — `src/lib/url-safety.test.ts` 패턴 참고.
- Sentry 서버 사이드 수동 캡처는 이 저장소에 선례가 없는 첫 사례다 — `import * as Sentry from "@sentry/nextjs";` 형태로 import한다(`src/app/global-error.tsx`, `src/instrumentation.ts`와 동일한 import 스타일).

---

### Task 1: `src/lib/csp.ts` — CSP 정책 조립 순수 함수

**Files:**
- Create: `src/lib/csp.ts`
- Test: `src/lib/csp.test.ts`

**Interfaces:**
- Produces: `buildCsp(nonce: string): string` — 이후 Task 2(`middleware.ts`)에서 `buildCsp(nonce)` 형태로 호출.

- [ ] **Step 1: 실패하는 테스트 작성**

`src/lib/csp.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildCsp } from "./csp";

describe("buildCsp", () => {
  it("includes the nonce in script-src", () => {
    const csp = buildCsp("abc123==");
    expect(csp).toContain("'nonce-abc123=='");
  });

  it("includes strict-dynamic alongside the nonce in script-src", () => {
    const csp = buildCsp("abc123==");
    expect(csp).toMatch(/script-src[^;]*'strict-dynamic'/);
  });

  it("restricts default-src to self", () => {
    expect(buildCsp("n")).toContain("default-src 'self'");
  });

  it("allows https: images for hotlinked blog content", () => {
    expect(buildCsp("n")).toMatch(/img-src[^;]*https:/);
  });

  it("allows the GA4 script host and beacon hosts", () => {
    const csp = buildCsp("n");
    expect(csp).toContain("https://www.googletagmanager.com");
    expect(csp).toMatch(/connect-src[^;]*google-analytics\.com/);
  });

  it("allows YouTube and Vimeo frame embeds", () => {
    const csp = buildCsp("n");
    expect(csp).toContain("https://www.youtube.com");
    expect(csp).toContain("https://player.vimeo.com");
  });

  it("blocks object-src entirely", () => {
    expect(buildCsp("n")).toContain("object-src 'none'");
  });

  it("restricts form-action and frame-ancestors to self", () => {
    const csp = buildCsp("n");
    expect(csp).toContain("form-action 'self'");
    expect(csp).toContain("frame-ancestors 'self'");
  });

  it("points report-uri at the csp-report route", () => {
    expect(buildCsp("n")).toContain("report-uri /api/csp-report");
  });

  it("produces a different policy string for different nonces", () => {
    expect(buildCsp("aaa")).not.toEqual(buildCsp("bbb"));
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx vitest run src/lib/csp.test.ts`
Expected: FAIL — `Cannot find module './csp'` (파일이 아직 없음)

- [ ] **Step 3: 최소 구현 작성**

`src/lib/csp.ts`:

```ts
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
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx vitest run src/lib/csp.test.ts`
Expected: PASS (10 tests)

- [ ] **Step 5: 커밋**

```bash
git add src/lib/csp.ts src/lib/csp.test.ts
git commit -m "feat: CSP 정책 조립 함수 buildCsp 추가"
```

---

### Task 2: `/api/csp-report` — 위반 리포트 수집 라우트

**Files:**
- Create: `src/app/api/csp-report/route.ts`
- Test: `src/app/api/csp-report/route.test.ts`

**Interfaces:**
- Consumes: 없음 (독립 라우트)
- Produces: `POST` 핸들러가 `https://<host>/api/csp-report`에 마운트됨 — Task 3(`csp.ts`의 `report-uri`)과 Task 4(미들웨어가 실제로 이 경로로 브라우저가 리포트를 보내게 함)가 이 경로 문자열에 의존.

- [ ] **Step 1: 실패하는 테스트 작성**

`src/app/api/csp-report/route.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@sentry/nextjs", () => ({
  captureMessage: vi.fn(),
}));

describe("POST /api/csp-report", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("logs a valid csp-report body to Sentry and returns 204", async () => {
    const Sentry = await import("@sentry/nextjs");
    const { POST } = await import("./route");

    const request = new Request("http://localhost/api/csp-report", {
      method: "POST",
      body: JSON.stringify({
        "csp-report": {
          "blocked-uri": "https://evil.example.com/x.js",
          "violated-directive": "script-src",
          "document-uri": "https://coredxi.com/",
        },
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(204);
    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      "CSP Violation",
      expect.objectContaining({ level: "warning" })
    );
  });

  it("returns 400 for an unparseable body", async () => {
    const { POST } = await import("./route");
    const request = new Request("http://localhost/api/csp-report", {
      method: "POST",
      body: "not json",
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx vitest run src/app/api/csp-report/route.test.ts`
Expected: FAIL — `Cannot find module './route'`

- [ ] **Step 3: 최소 구현 작성**

`src/app/api/csp-report/route.ts`:

```ts
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch (e) {
    console.error("[csp-report]", e);
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const report =
    body && typeof body === "object" && "csp-report" in body
      ? (body as Record<string, unknown>)["csp-report"]
      : body;

  Sentry.captureMessage("CSP Violation", {
    level: "warning",
    extra: { report },
  });

  return new NextResponse(null, { status: 204 });
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx vitest run src/app/api/csp-report/route.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: 커밋**

```bash
git add src/app/api/csp-report/route.ts src/app/api/csp-report/route.test.ts
git commit -m "feat: CSP 위반 리포트 수집 라우트 추가 (Sentry 연동)"
```

---

### Task 3: `src/middleware.ts` — nonce 생성 + Report-Only 헤더 적용

**Files:**
- Modify: `src/middleware.ts` (전체 파일, 현재 45줄)

**Interfaces:**
- Consumes: `buildCsp(nonce: string): string` from `src/lib/csp.ts` (Task 1).
- Produces: 모든 응답에 `x-nonce` 요청 헤더(다운스트림 Server Component가 `headers()`로 읽음, Task 4에서 사용) + `Content-Security-Policy-Report-Only` 응답 헤더.

- [ ] **Step 1: 기존 파일 전체 교체**

`src/middleware.ts` (전체 교체 — 기존 `/admin`, `/concepts` 로직은 그대로 유지하고 CSP 헤더 부착 로직만 추가):

```ts
import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { NextResponse } from "next/server";
import { buildCsp } from "@/lib/csp";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);

  const withCsp = (response: NextResponse): NextResponse => {
    response.headers.set("Content-Security-Policy-Report-Only", csp);
    return response;
  };

  const next = () =>
    withCsp(NextResponse.next({ request: { headers: requestHeaders } }));

  if (
    req.nextUrl.pathname.startsWith("/concepts") &&
    process.env.NODE_ENV === "production"
  ) {
    return withCsp(new NextResponse("Not Found", { status: 404 }));
  }

  if (!req.nextUrl.pathname.startsWith("/admin")) {
    return next();
  }

  if (req.nextUrl.pathname === "/admin/login") {
    return next();
  }

  if (!req.auth) {
    const login = new URL("/admin/login", req.url);
    login.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return withCsp(NextResponse.redirect(login));
  }

  const { accountType, role } = req.auth.user ?? {};
  if (
    accountType !== "admin" ||
    (role !== "SUPER_ADMIN" && role !== "EDITOR")
  ) {
    const login = new URL("/admin/login", req.url);
    login.searchParams.set("error", "Forbidden");
    return withCsp(NextResponse.redirect(login));
  }

  return next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
```

- [ ] **Step 2: 타입체크 + 기존 admin 가드 로직이 그대로인지 확인**

Run: `npx tsc --noEmit`
Expected: 에러 없음 (`buildCsp`, `Headers`, `crypto.randomUUID`, `Buffer` 타입 모두 통과)

- [ ] **Step 3: 개발 서버로 CSP 헤더 부착 확인**

Run (별도 터미널에서 `npm run dev` 먼저 실행 후):
```bash
curl -sI http://localhost:3100/ | grep -i content-security-policy-report-only
```
Expected: `content-security-policy-report-only: default-src 'self'; script-src 'self' 'nonce-...' 'strict-dynamic' https:; ...` 형태의 헤더가 출력됨 (매 요청마다 nonce 값이 달라야 함 — 두 번 연속 실행해 값이 다른지 확인).

- [ ] **Step 4: 기존 admin 가드 회귀 확인**

Run: `npx playwright test admin-login`
Expected: PASS (`E2E_ADMIN_EMAIL`/`E2E_ADMIN_PASSWORD` 미설정 시 자동 skip — 이 경우 스킵도 정상)

- [ ] **Step 5: 커밋**

```bash
git add src/middleware.ts
git commit -m "feat: 미들웨어에서 요청별 nonce 생성 및 CSP Report-Only 헤더 적용"
```

---

### Task 4: `src/app/layout.tsx` — nonce를 인라인 스크립트에 적용

**Files:**
- Modify: `src/app/layout.tsx:1-154`

**Interfaces:**
- Consumes: Task 3에서 미들웨어가 설정한 `x-nonce` 요청 헤더 (`next/headers`의 `headers()`로 읽음).

- [ ] **Step 1: `headers` import 추가 및 컴포넌트를 async로 변경**

`src/app/layout.tsx`의 import 블록 수정 (10번째 줄 `import type { Metadata } from "next";` 아래에 추가):

```ts
import { headers } from "next/headers";
```

- [ ] **Step 2: nonce 읽기 및 Script/JSON-LD에 적용**

`RootLayout` 함수 전체를 다음으로 교체 (92~154번 줄):

```tsx
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteJsonLd = buildSiteJsonLd();
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    /* lang="ko" — 화면 읽기 프로그램과 SEO를 위해 한국어로 설정 */
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* [홍보팀] Google Analytics(구글 애널리틱스) 방문자 추적 코드입니다. .env의 NEXT_PUBLIC_GA_MEASUREMENT_ID 값을 수정하세요. */}
        {gaMeasurementId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
              strategy="afterInteractive"
              nonce={nonce}
            />
            <Script id="google-analytics" strategy="afterInteractive" nonce={nonce}>
              {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaMeasurementId}');
          `}
            </Script>
          </>
        ) : null}
        {/* [홍보팀] 네이버 서치어드바이저 사이트 소유 확인용 메타 태그입니다. 등록 건마다 코드가 다를 수 있습니다. */}
        <meta
          name="naver-site-verification"
          content="875becbd46b223c2a689b9154f11335a6326f85d"
        />
        <meta
          name="naver-site-verification"
          content="62def37bfa19ead530193e944ae227af1667048c"
        />
        {siteJsonLd.map((schema) => (
          <script
            key={schema["@type"] as string}
            type="application/ld+json"
            nonce={nonce}
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/brand/favicon-32x32.png?v=2"
        />
        <link rel="icon" href="/favicon.ico?v=2" sizes="any" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AuthProvider>
            {children}
            <Toaster richColors position="top-center" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: 타입체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 4: 개발 서버에서 nonce가 실제로 주입되는지 확인**

Run (`npm run dev` 실행 중인 상태에서):
```bash
curl -s http://localhost:3100/ | grep -o 'nonce="[^"]*"' | head -3
```
Expected: `<script>` 태그들에 동일한 nonce 값이 최소 2곳 이상(GA4 스크립트, JSON-LD) 출력됨. 이 값이 Task 3 Step 3에서 확인한 `Content-Security-Policy-Report-Only` 헤더의 `'nonce-...'` 값과 동일해야 함(같은 요청의 응답 헤더와 본문을 비교).

- [ ] **Step 5: 커밋**

```bash
git add src/app/layout.tsx
git commit -m "feat: layout에 요청별 CSP nonce를 GA4/JSON-LD 인라인 스크립트에 적용"
```

---

### Task 5: 전체 회귀 검증 + TODO.md 갱신

**Files:**
- Modify: `docs/TODO.md`

**Interfaces:**
- Consumes: Task 1~4의 전체 결과물.

- [ ] **Step 1: 유닛 테스트 전체 실행**

Run: `npm test`
Expected: 기존 89개 + 신규 12개(csp.test.ts 10개 + route.test.ts 2개) = 101개 PASS, 0 FAIL

- [ ] **Step 2: Playwright E2E 골든패스 전체 실행**

Run: `npm run test:e2e`
Expected: 4개 스펙(`contact-form`, `admin-login` 성공/실패, `admin-blog-publish`) PASS 또는(관리자 계정 미설정 시) admin 관련 스펙 자동 skip. `contact-form.spec.ts`는 계정 불필요하므로 반드시 PASS해야 함.

- [ ] **Step 3: 수동 브라우저 검증 (개발 서버, `npm run dev`, http://localhost:3100)**

다음 항목을 브라우저 DevTools Console/Network 탭에서 CSP 위반(`Refused to ...` 경고)이 뜨는지 확인하며 점검한다. Report-Only 모드이므로 위반이 있어도 기능은 차단되지 않지만, 위반 로그가 있다는 것은 허용 목록 누락을 의미하므로 `src/lib/csp.ts`를 조정해야 한다:

  - [ ] `/login`에서 Google/Kakao/Naver OAuth 로그인 각각 시도 → 정상적으로 리다이렉트되고 콜백 후 로그인되는지.
  - [ ] `/admin/login`에서 관리자 로그인 성공/실패 플로우.
  - [ ] `/contact`에서 문의 폼 제출.
  - [ ] `/cases/[slug]`에서 YouTube 및 Vimeo 영상이 등록된 케이스 각각 열어 iframe이 정상 재생되는지.
  - [ ] 아무 페이지에서나 Network 탭에 `google-analytics.com` 또는 `googletagmanager.com`으로 나가는 gtag 비콘 요청이 찍히는지.
  - [ ] 브라우저 콘솔에 에러를 하나 강제로 발생시켜(예: 존재하지 않는 함수 호출을 임시로 추가) Sentry 대시보드에 캡처되는지 확인 후 임시 코드 제거.
  - [ ] DevTools Console에 CSP 위반 경고가 하나도 없는지 최종 확인.

- [ ] **Step 4: `docs/TODO.md` 갱신**

`docs/TODO.md`의 §2 "개선이 필요한 항목"에서 CSP 관련 행을 제거하고, §1 "완료된 기능"에 다음 항목 추가:

```markdown
- ✅ **CSP(Content-Security-Policy) Report-Only 도입** — nonce 기반(`src/lib/csp.ts`), GA4/영상임베드/OAuth 허용 목록 확정, 위반 리포트 Sentry 연동(`/api/csp-report`). 1주 프로덕션 모니터링 후 enforcing 전환 예정(`docs/superpowers/specs/2026-07-19-csp-design.md` 참고)
```

§4 "향후 계획"의 "💡 CSP 도입" 행은 제거(완료로 이동했으므로).

- [ ] **Step 5: 커밋**

```bash
git add docs/TODO.md
git commit -m "docs: CSP Report-Only 도입 완료 상태를 TODO.md에 반영"
```

---

## Phase 2/3 후속 작업 (이 계획의 범위 밖 — 별도 실행 시점 필요)

- **Phase 2** (약 1주 후): 프로덕션 Sentry에서 `"CSP Violation"` 메시지를 검색해 실제 위반 사례 검토. 누락된 허용 항목이 있으면 `src/lib/csp.ts`의 `buildCsp()`에 추가하고 Task 1의 테스트에 케이스를 보강한다.
- **Phase 3** (Phase 2에서 위반 없음 확인 후): `src/middleware.ts`의 `response.headers.set("Content-Security-Policy-Report-Only", csp)`를 `response.headers.set("Content-Security-Policy", csp)`로 변경(헤더명만 교체, `withCsp` 함수 한 곳만 수정하면 됨). `docs/TODO.md`의 완료 항목 문구에서 "Report-Only" 표현 제거.
