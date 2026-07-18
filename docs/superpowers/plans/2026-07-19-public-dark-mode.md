# 공개 페이지 다크모드 지원 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 공개 페이지(홈/소개/솔루션/성공사례/블로그/문의/로그인/회원가입/404) 24개 파일이 라이트·다크 모두에서 일관되게 렌더링되도록 하고, Header에 명시적 토글 버튼을 추가한다.

**Architecture:** `next-themes`의 `ThemeProvider`를 루트 레이아웃에 새로 연결하고(`attribute="class"`, `defaultTheme="light"`), `globals.css`에 이미 완성된 `.dark` CSS 변수 팔레트를 24개 파일이 실제로 쓰도록 하드코딩된 Tailwind 색상 클래스를 `bg-background`/`text-foreground`/`bg-card`/`text-muted-foreground`/`border-border` 등으로 교체한다. Header에 `Sun`/`Moon` 아이콘 토글을 추가한다.

**Tech Stack:** Next.js 15 App Router, Tailwind CSS(CSS 변수 기반 테마), `next-themes` (^0.4.6, 이미 설치됨), `lucide-react` (이미 설치됨), `@playwright/test` (검증용).

## Global Constraints

- 새 의존성 설치 금지 — `next-themes`, `lucide-react`, `@playwright/test` 모두 이미 설치되어 있다.
- 범위 제외(수정 금지): `src/app/concepts/page.tsx`, `src/components/editor/{BlockEditor,BlockEditorInner,TiptapEditor,TiptapEditorInner}.tsx`, `src/app/setup/{setup-db-error,setup-form}.tsx`, `src/app/admin/**` 전체.
- 기본 테마는 항상 `light`. `enableSystem={false}`로 OS 설정을 따라가지 않는다.
- 색상 교체 매핑 (모든 리팩터 태스크가 따라야 하는 규칙):

  | 하드코딩 | 교체 | 용도 |
  |---|---|---|
  | `bg-white` (페이지/헤더 최상위 배경) | `bg-background` | 페이지 최상위 배경 |
  | `bg-white` (카드/패널처럼 배경 위에 뜬 표면) | `bg-card` | 카드형 표면 |
  | `text-slate-900`, `text-slate-800` | `text-foreground` | 본문 강조 텍스트 |
  | `text-slate-600`, `text-slate-500` | `text-muted-foreground` | 보조/설명 텍스트 |
  | `bg-slate-100`, `bg-slate-50` (hover, 섹션 구분 배경) | `bg-muted` 또는 `bg-accent` | 옅은 배경 |
  | `border-slate-200`, `border-slate-200/60` | `border-border` | 테두리 |

  브랜드 컬러(`primary`, `destructive` 등 이미 `bg-primary`/`text-primary`처럼 토큰인 것)는 손대지 않는다. 그라디언트나 이미지 오버레이처럼 위 표에 매끄럽게 안 맞는 경우만 예외적으로 `dark:` variant를 붙이는 것을 허용하되, 파일별로 최소화하고 왜 예외인지 구현 보고서에 남긴다.
- DB 마이그레이션 없음.

---

### Task 1: ThemeProvider 인프라 + 검증 스크립트

**Files:**
- Create: `src/components/theme-provider.tsx`
- Create: `scripts/theme-check.mjs`
- Modify: `src/app/layout.tsx`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: 없음 (신규 인프라)
- Produces:
  - `ThemeProvider` (from `@/components/theme-provider`) — Task 2가 `layout.tsx`에서 이미 이 태스크가 연결하므로, 이후 태스크는 그냥 존재를 전제하고 별도로 import하지 않는다.
  - `scripts/theme-check.mjs <route> [<route> ...]` — 이후 모든 태스크가 자신의 라우트로 이 스크립트를 재사용한다. `node scripts/theme-check.mjs /terms` 형태로 호출하며, dev 서버(`npm run dev`, 포트 3100)가 떠 있어야 한다. 라이트/다크 각각에서 콘솔 에러가 없는지, `<html>`에 `dark` 클래스가 기대대로 붙는지 확인하고 `.theme-check/` 폴더에 스크린샷을 남긴다. 실패 시 exit code 1.

- [ ] **Step 1: `theme-provider.tsx` 작성**

`src/components/theme-provider.tsx`:

```tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

- [ ] **Step 2: `layout.tsx`에 연결**

`src/app/layout.tsx`의 import 구역에 추가:

```tsx
import { ThemeProvider } from "@/components/theme-provider";
```

`<html lang="ko">`를 찾아서:

```tsx
    <html lang="ko">
```

다음으로 교체:

```tsx
    <html lang="ko" suppressHydrationWarning>
```

그리고 `<body>` 내부의 아래 블록을 찾는다:

```tsx
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          {children}
          <Toaster richColors position="top-center" />
        </AuthProvider>
      </body>
```

다음으로 교체한다 (`ThemeProvider`로 감싸기):

```tsx
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AuthProvider>
            {children}
            <Toaster richColors position="top-center" />
          </AuthProvider>
        </ThemeProvider>
      </body>
```

- [ ] **Step 3: 검증 스크립트 작성**

`scripts/theme-check.mjs`:

```js
#!/usr/bin/env node
// 라이트/다크 두 테마로 지정한 라우트를 순회하며 콘솔 에러와 <html> 클래스,
// 스크린샷을 남긴다. 사전 조건: `npm run dev`로 개발 서버가
// http://localhost:3100 에서 실행 중이어야 한다.
// 사용법: node scripts/theme-check.mjs /route1 /route2 ...

import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = "http://localhost:3100";
const OUT_DIR = ".theme-check";
const routes = process.argv.slice(2);

if (routes.length === 0) {
  console.error("usage: node scripts/theme-check.mjs /route1 /route2 ...");
  process.exit(2);
}

mkdirSync(OUT_DIR, { recursive: true });

let hadError = false;
const browser = await chromium.launch({ headless: true });

for (const route of routes) {
  for (const theme of ["light", "dark"]) {
    const page = await browser.newPage();
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(String(err)));

    await page.goto(BASE + route, { waitUntil: "networkidle" });
    await page.evaluate((t) => localStorage.setItem("theme", t), theme);
    await page.reload({ waitUntil: "networkidle" });

    const htmlClass = await page.evaluate(() => document.documentElement.className);
    const isDarkApplied = htmlClass.includes("dark");
    if (theme === "dark" && !isDarkApplied) {
      console.error(`[FAIL] ${route} (${theme}): <html> missing "dark" class`);
      hadError = true;
    }
    if (theme === "light" && isDarkApplied) {
      console.error(`[FAIL] ${route} (${theme}): <html> unexpectedly has "dark" class`);
      hadError = true;
    }

    const safeName = route === "/" ? "home" : route.replace(/\//g, "_");
    await page.screenshot({
      path: `${OUT_DIR}/${safeName}-${theme}.png`,
      fullPage: true,
    });

    if (consoleErrors.length > 0) {
      console.error(`[FAIL] ${route} (${theme}): console errors:`, consoleErrors.slice(0, 5));
      hadError = true;
    } else {
      console.log(`[OK] ${route} (${theme})`);
    }

    await page.close();
  }
}

await browser.close();

if (hadError) {
  console.error("\ntheme-check: FAILED — see above");
  process.exit(1);
}
console.log("\ntheme-check: all routes passed in both themes");
```

- [ ] **Step 4: `.gitignore`에 출력 폴더 추가**

`.gitignore` 끝에 추가:

```
.theme-check/
```

- [ ] **Step 5: 정적 검증**

Run: `npx tsc --noEmit`
Expected: 타입 에러 없음.

Run: `npm run lint`
Expected: 기존 baseline과 동일 (새 에러 없음).

- [ ] **Step 6: 개발 서버로 동작 검증**

`/terms`는 이미 `bg-background`/`text-foreground` 같은 시맨틱 토큰을 쓰고 있어(이번 플랜 범위 밖에서 이미 완료됨), `ThemeProvider`가 실제로 작동하는지 확인하는 좋은 대상이다.

Run (백그라운드): `npm run dev`
서버가 `http://localhost:3100`에서 준비될 때까지 대기 (`curl -s -o /dev/null -w "%{http_code}" http://localhost:3100/`가 200을 반환할 때까지, 최대 30초).

Run: `node scripts/theme-check.mjs /terms`
Expected: `[OK] /terms (light)`, `[OK] /terms (dark)` 출력, exit code 0. `.theme-check/terms-light.png`와 `.theme-check/terms-dark.png`를 열어 실제로 배경/글자색이 바뀌었는지 육안 확인 (다크 스크린샷 배경이 `#0F172A` 계열의 짙은 남색이어야 한다).

서버 종료: `netstat -ano | grep ":3100" | grep LISTENING`으로 PID 찾아 `taskkill //F //T //PID <PID>` (Windows).

- [ ] **Step 7: 회귀 테스트**

Run: `npm run test`
Expected: 기존 스위트 전부 통과 (86/86, 이번 태스크는 새 유닛 테스트를 추가하지 않음 — 스타일/인프라 변경이라 기존 커버리지에 영향 없어야 함).

- [ ] **Step 8: 커밋**

```bash
git add src/components/theme-provider.tsx scripts/theme-check.mjs src/app/layout.tsx .gitignore
git commit -m "feat: ThemeProvider 연결 및 다크모드 검증 스크립트 추가"
```

---

### Task 2: Header/Footer 다크모드 + 토글 버튼

**Files:**
- Create: `src/components/ThemeToggle.tsx`
- Modify: `src/components/Header.tsx`
- Modify: `src/components/Footer.tsx`

**Interfaces:**
- Consumes: Task 1의 `ThemeProvider`(이미 `layout.tsx`에 연결되어 있어 `useTheme()`이 어디서든 동작), `scripts/theme-check.mjs`.
- Produces: `ThemeToggle` 컴포넌트 — 이후 태스크는 사용하지 않는다(Header에만 배치).

- [ ] **Step 1: `ThemeToggle.tsx` 작성**

`src/components/ThemeToggle.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-9" aria-hidden="true" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {isDark ? (
        <Sun className="h-[18px] w-[18px]" aria-hidden="true" />
      ) : (
        <Moon className="h-[18px] w-[18px]" aria-hidden="true" />
      )}
    </button>
  );
}
```

`mounted` 체크는 서버(항상 라이트 렌더)와 클라이언트(저장된 테마)의 첫 렌더가 어긋나 hydration 경고가 나는 것을 막기 위한 표준 패턴이다.

- [ ] **Step 2: `Header.tsx`에 토글 배치 + 색상 토큰화**

`src/components/Header.tsx` 상단 import에 추가:

```tsx
import { ThemeToggle } from "@/components/ThemeToggle";
```

아래 6곳을 찾아 교체한다 (파일 내 정확한 문자열로 찾을 것):

1. 헤더 배경 (스크롤 시):
   - 찾기: `"bg-white/80 backdrop-blur-lg border-b border-slate-200/60"`
   - 교체: `"bg-background/80 backdrop-blur-lg border-b border-border/60"`

2. 데스크탑 네비 링크 (`NAV_ITEMS.map` 안):
   - 찾기: `"relative px-4 py-2 text-sm font-medium text-slate-600 rounded-md transition-all duration-200 hover:text-slate-900 hover:bg-slate-100"`
   - 교체: `"relative px-4 py-2 text-sm font-medium text-muted-foreground rounded-md transition-all duration-200 hover:text-foreground hover:bg-accent"`

3. 로그인 상태 배지 배경:
   - 찾기: `"flex items-center gap-2 rounded-full border border-border/60 bg-white/80 py-1 pl-1 pr-2 shadow-sm"`
   - 교체: `"flex items-center gap-2 rounded-full border border-border/60 bg-background/80 py-1 pl-1 pr-2 shadow-sm"`

4. 로그아웃 버튼:
   - 찾기: `"inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-slate-600 rounded-md transition-all duration-200 hover:text-slate-900 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"`
   - 교체: `"inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-muted-foreground rounded-md transition-all duration-200 hover:text-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"`
   - 주의: 로그인 버튼(`HEADER_BUTTONS.login.href`)에도 동일한 클래스 문자열이 있다 — **양쪽 다** 교체한다 (파일에 이 정확한 문자열이 2번 나온다).

5. 모바일 메뉴 드롭다운 배경:
   - 찾기: `"bg-white/98 backdrop-blur-md border-t border-border/30"`
   - 교체: `"bg-background/98 backdrop-blur-md border-t border-border/30"`

이제 토글 버튼을 배치한다. 아래 코드를 찾는다:

```tsx
          {/* ─── 우측: 버튼 2개 (lg 이상) + 햄버거 (lg 미만) ─── */}
          <div className="flex items-center gap-3">

            {/* [홍보팀] 로그인 여부에 따라 오른쪽 버튼 구역이 바뀝니다. 비로그인: 로그인·도입 문의 / 로그인: 프로필·로그아웃·도입 문의 */}
            <div className="hidden lg:flex items-center gap-2">
```

다음으로 교체 (모바일·데스크탑 모두에서 항상 보이도록 `hidden lg:flex` 바깥에 배치):

```tsx
          {/* ─── 우측: 버튼 2개 (lg 이상) + 햄버거 (lg 미만) ─── */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {/* [홍보팀] 로그인 여부에 따라 오른쪽 버튼 구역이 바뀝니다. 비로그인: 로그인·도입 문의 / 로그인: 프로필·로그아웃·도입 문의 */}
            <div className="hidden lg:flex items-center gap-2">
```

- [ ] **Step 3: `Footer.tsx` 색상 토큰화**

`src/components/Footer.tsx` 전체를 아래로 교체한다:

```tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="text-lg font-bold tracking-tight text-foreground">
              CoreDXI
            </p>
            <p className="text-sm text-muted-foreground">
              © 2026 CoreDXI. All rights reserved.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-muted-foreground">
            <Link
              href="/terms"
              className="transition-colors duration-300 hover:text-foreground"
            >
              이용약관
            </Link>
            <Link
              href="/privacy"
              className="transition-colors duration-300 hover:text-foreground"
            >
              개인정보처리방침
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-primary transition-colors duration-300 hover:text-primary/80"
            >
              문의하기
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: 정적 검증**

Run: `npx tsc --noEmit` — 타입 에러 없음.
Run: `npm run lint` — 새 에러 없음.

- [ ] **Step 5: 남은 하드코딩 색상 확인**

Run: `grep -nE "bg-white|text-slate-[0-9]|bg-slate-[0-9]|border-slate-[0-9]" src/components/Header.tsx src/components/Footer.tsx src/components/ThemeToggle.tsx`
Expected: 매치 없음 (exit code 1 from grep = no matches = pass).

- [ ] **Step 6: 개발 서버로 시각 검증**

`npm run dev`를 백그라운드로 실행한 뒤, 서버가 준비될 때까지 대기한다:

```bash
until curl -s -o /dev/null -w "%{http_code}" http://localhost:3100/ | grep -q 200; do sleep 1; done
```

Run: `node scripts/theme-check.mjs /`
Expected: `[OK] / (light)`, `[OK] / (dark)`. `.theme-check/home-*.png`를 열어 Header/Footer가 라이트에선 흰 배경, 다크에선 짙은 남색 배경으로 바뀌었는지, 토글 버튼(해/달 아이콘)이 우측 상단에 보이는지 확인.

서버 종료: `netstat -ano | grep ":3100" | grep LISTENING`으로 PID 찾아 `taskkill //F //T //PID <PID>` (Windows).

- [ ] **Step 7: 회귀 테스트**

Run: `npm run test` — 전부 통과.
Run: `npm run test:e2e` — 기존 골든패스(문의 제출, 관리자 로그인) 통과 (Header 구조는 바뀌지 않고 클래스만 바뀌었으므로 셀렉터 영향 없어야 함).

- [ ] **Step 8: 커밋**

```bash
git add src/components/ThemeToggle.tsx src/components/Header.tsx src/components/Footer.tsx
git commit -m "feat: Header·Footer 다크모드 대응 및 테마 토글 버튼 추가"
```

---

### Task 3: 홈페이지 클러스터 (page.tsx, Hero.tsx, CasesPreview.tsx)

**Files:**
- Modify: `src/app/page.tsx`, `src/components/Hero.tsx`, `src/components/CasesPreview.tsx`

**Interfaces:**
- Consumes: Global Constraints의 색상 매핑 표, Task 1의 `scripts/theme-check.mjs`.
- Produces: 없음.

- [ ] **Step 1: 색상 토큰화**

세 파일을 각각 읽고, Global Constraints의 매핑 표를 그대로 적용한다: `bg-white`(페이지 최상위 배경) → `bg-background`, `bg-white`(카드성 표면) → `bg-card`, `text-slate-900`/`text-slate-800` → `text-foreground`, `text-slate-600`/`text-slate-500` → `text-muted-foreground`, `bg-slate-100`/`bg-slate-50` → `bg-muted` 또는 `bg-accent`(hover면 accent, 정적 섹션 배경이면 muted), `border-slate-200` 계열 → `border-border`. `bg-primary`, `text-primary`, `bg-destructive` 등 이미 토큰인 것과 이미지/그라디언트는 건드리지 않는다.

- [ ] **Step 2: 정적 검증**

Run: `npx tsc --noEmit` — 타입 에러 없음.
Run: `npm run lint` — 새 에러 없음.

- [ ] **Step 3: 남은 하드코딩 색상 확인**

Run: `grep -nE "bg-white|text-slate-[0-9]|bg-slate-[0-9]|border-slate-[0-9]" src/app/page.tsx src/components/Hero.tsx src/components/CasesPreview.tsx`
Expected: 매치 없음. 남는 게 있다면 왜 예외인지(Global Constraints의 dark: variant 예외 규정) 구현 보고서에 명시.

- [ ] **Step 4: 개발 서버로 시각 검증**

`npm run dev`를 백그라운드로 실행한 뒤, 서버가 준비될 때까지 대기한다:

```bash
until curl -s -o /dev/null -w "%{http_code}" http://localhost:3100/ | grep -q 200; do sleep 1; done
```

Run: `node scripts/theme-check.mjs /`
Expected: 라이트/다크 모두 `[OK]`, 콘솔 에러 없음. `.theme-check/home-dark.png`를 열어 히어로 섹션·성공사례 미리보기 카드가 다크 배경에서 읽기 가능한 대비로 보이는지 육안 확인.

서버 종료: `netstat -ano | grep ":3100" | grep LISTENING`으로 PID 찾아 `taskkill //F //T //PID <PID>` (Windows).

- [ ] **Step 5: 회귀 테스트**

Run: `npm run test` — 전부 통과.

- [ ] **Step 6: 커밋**

```bash
git add src/app/page.tsx src/components/Hero.tsx src/components/CasesPreview.tsx
git commit -m "feat: 홈페이지(Hero·성공사례 미리보기) 다크모드 대응"
```

---

### Task 4: 회사소개 + 솔루션 페이지

**Files:**
- Modify: `src/app/about/page.tsx`, `src/app/solutions/page.tsx`

**Interfaces:**
- Consumes: Global Constraints 매핑 표, `scripts/theme-check.mjs`.
- Produces: 없음.

- [ ] **Step 1: 색상 토큰화** — Task 3 Step 1과 동일한 매핑 규칙을 두 파일에 적용.

- [ ] **Step 2: 정적 검증** — `npx tsc --noEmit`, `npm run lint` 모두 통과.

- [ ] **Step 3: 남은 하드코딩 색상 확인**

Run: `grep -nE "bg-white|text-slate-[0-9]|bg-slate-[0-9]|border-slate-[0-9]" src/app/about/page.tsx src/app/solutions/page.tsx`
Expected: 매치 없음.

- [ ] **Step 4: 개발 서버로 시각 검증**

`npm run dev`를 백그라운드로 실행한 뒤, 서버가 준비될 때까지 대기한다:

```bash
until curl -s -o /dev/null -w "%{http_code}" http://localhost:3100/ | grep -q 200; do sleep 1; done
```

Run: `node scripts/theme-check.mjs /about /solutions`
Expected: 4개 모두(각 라우트 x 라이트/다크) `[OK]`. 스크린샷 육안 확인.

서버 종료: `netstat -ano | grep ":3100" | grep LISTENING`으로 PID 찾아 `taskkill //F //T //PID <PID>` (Windows).

- [ ] **Step 5: 회귀 테스트** — `npm run test` 전부 통과.

- [ ] **Step 6: 커밋**

```bash
git add src/app/about/page.tsx src/app/solutions/page.tsx
git commit -m "feat: 회사소개·솔루션 페이지 다크모드 대응"
```

---

### Task 5: 성공사례 클러스터

**Files:**
- Modify: `src/app/cases/page.tsx`, `src/app/cases/[slug]/page.tsx`, `src/components/cases/CaseCard.tsx`, `src/components/cases/CaseFilterGrid.tsx`

**Interfaces:**
- Consumes: Global Constraints 매핑 표, `scripts/theme-check.mjs`.
- Produces: 없음.

- [ ] **Step 1: 색상 토큰화** — 4개 파일에 동일한 매핑 규칙 적용. `CaseCard.tsx`는 카드형 컴포넌트이므로 배경은 `bg-card`가 기본값이어야 한다(페이지 배경과 구분되는 표면).

- [ ] **Step 2: 정적 검증** — `npx tsc --noEmit`, `npm run lint`.

- [ ] **Step 3: 남은 하드코딩 색상 확인**

Run: `grep -nE "bg-white|text-slate-[0-9]|bg-slate-[0-9]|border-slate-[0-9]" src/app/cases/page.tsx "src/app/cases/[slug]/page.tsx" src/components/cases/CaseCard.tsx src/components/cases/CaseFilterGrid.tsx`
Expected: 매치 없음.

- [ ] **Step 4: 개발 서버로 시각 검증**

`npm run dev`를 백그라운드로 실행한 뒤, 서버가 준비될 때까지 대기한다:

```bash
until curl -s -o /dev/null -w "%{http_code}" http://localhost:3100/ | grep -q 200; do sleep 1; done
```

Run: `node scripts/theme-check.mjs /cases /cases/a-ax`
(`a-ax`는 DB에 존재하는 실제 케이스 slug — 없다면 `npx prisma studio`나 관리자 패널에서 임의의 발행된 케이스 slug로 대체)
Expected: 4개 조합 모두 `[OK]`.

서버 종료: `netstat -ano | grep ":3100" | grep LISTENING`으로 PID 찾아 `taskkill //F //T //PID <PID>` (Windows).

- [ ] **Step 5: 회귀 테스트** — `npm run test` 전부 통과.

- [ ] **Step 6: 커밋**

```bash
git add src/app/cases/page.tsx "src/app/cases/[slug]/page.tsx" src/components/cases/CaseCard.tsx src/components/cases/CaseFilterGrid.tsx
git commit -m "feat: 성공사례 목록·상세 다크모드 대응"
```

---

### Task 6: 블로그 클러스터

**Files:**
- Modify: `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx`, `src/app/blog/category/[slug]/page.tsx`, `src/components/blog/BlogPostGrid.tsx`, `src/components/blog/BlogShell.tsx`, `src/components/blog/BlogSidebar.tsx`

**Interfaces:**
- Consumes: Global Constraints 매핑 표, `scripts/theme-check.mjs`.
- Produces: 없음.

- [ ] **Step 1: 색상 토큰화** — 6개 파일에 동일한 매핑 규칙 적용. `blog/[slug]/page.tsx`는 Tiptap/BlockNote 렌더 본문(`BlogPostContentServer` 등 별도 컴포넌트)을 포함할 수 있는데, 본문 콘텐츠 자체(글쓴이가 입력한 본문 HTML)는 이번 스펙 범위가 아니다 — 페이지 셸(제목, 메타 정보, 사이드바 등)만 토큰화한다.

- [ ] **Step 2: 정적 검증** — `npx tsc --noEmit`, `npm run lint`.

- [ ] **Step 3: 남은 하드코딩 색상 확인**

Run: `grep -nE "bg-white|text-slate-[0-9]|bg-slate-[0-9]|border-slate-[0-9]" src/app/blog/page.tsx "src/app/blog/[slug]/page.tsx" "src/app/blog/category/[slug]/page.tsx" src/components/blog/BlogPostGrid.tsx src/components/blog/BlogShell.tsx src/components/blog/BlogSidebar.tsx`
Expected: 매치 없음 (본문 HTML 렌더 영역 내부의 클래스는 이 grep이 애초에 이 파일들 안에서만 도는 것이므로 자연히 범위에 안 걸린다).

- [ ] **Step 4: 개발 서버로 시각 검증**

`npm run dev`를 백그라운드로 실행한 뒤, 서버가 준비될 때까지 대기한다:

```bash
until curl -s -o /dev/null -w "%{http_code}" http://localhost:3100/ | grep -q 200; do sleep 1; done
```

Run: `node scripts/theme-check.mjs /blog /blog/ai /blog/category/customer-stories`
(라우트가 없다면 `/blog` 목록에서 실제 존재하는 slug/카테고리로 대체)
Expected: 6개 조합 모두 `[OK]`.

서버 종료: `netstat -ano | grep ":3100" | grep LISTENING`으로 PID 찾아 `taskkill //F //T //PID <PID>` (Windows).

- [ ] **Step 5: 회귀 테스트** — `npm run test`, `npm run test:e2e`(블로그 발행 골든패스가 있으니 확인) 전부 통과.

- [ ] **Step 6: 커밋**

```bash
git add src/app/blog/page.tsx "src/app/blog/[slug]/page.tsx" "src/app/blog/category/[slug]/page.tsx" src/components/blog/BlogPostGrid.tsx src/components/blog/BlogShell.tsx src/components/blog/BlogSidebar.tsx
git commit -m "feat: 블로그 목록·상세·카테고리 다크모드 대응"
```

---

### Task 7: 문의·인증·404 클러스터

**Files:**
- Modify: `src/app/contact/ContactPageClient.tsx`, `src/components/contact/ContactFaqSection.tsx`, `src/app/login/page.tsx`, `src/app/signup/page.tsx`, `src/components/login/LoginSocialPanel.tsx`, `src/components/login/OAuthRedirectHelp.tsx`, `src/app/not-found.tsx`

**Interfaces:**
- Consumes: Global Constraints 매핑 표, `scripts/theme-check.mjs`.
- Produces: 없음.

- [ ] **Step 1: 색상 토큰화** — 7개 파일에 동일한 매핑 규칙 적용.

- [ ] **Step 2: 정적 검증** — `npx tsc --noEmit`, `npm run lint`.

- [ ] **Step 3: 남은 하드코딩 색상 확인**

Run: `grep -nE "bg-white|text-slate-[0-9]|bg-slate-[0-9]|border-slate-[0-9]" src/app/contact/ContactPageClient.tsx src/components/contact/ContactFaqSection.tsx src/app/login/page.tsx src/app/signup/page.tsx src/components/login/LoginSocialPanel.tsx src/components/login/OAuthRedirectHelp.tsx src/app/not-found.tsx`
Expected: 매치 없음.

- [ ] **Step 4: 개발 서버로 시각 검증**

`npm run dev`를 백그라운드로 실행한 뒤, 서버가 준비될 때까지 대기한다:

```bash
until curl -s -o /dev/null -w "%{http_code}" http://localhost:3100/ | grep -q 200; do sleep 1; done
```

Run: `node scripts/theme-check.mjs /contact /login /signup /this-route-does-not-exist`
(마지막 라우트는 404 페이지 확인용 — 실제로 존재하지 않는 경로를 하나 넣어 `not-found.tsx`를 트리거한다)
Expected: 8개 조합 모두 `[OK]`.

서버 종료: `netstat -ano | grep ":3100" | grep LISTENING`으로 PID 찾아 `taskkill //F //T //PID <PID>` (Windows).

- [ ] **Step 5: 회귀 테스트**

Run: `npm run test` 전부 통과.
Run: `npm run test:e2e` — 문의 제출 골든패스 통과 확인 (`ContactPageClient.tsx`가 수정 대상이므로 특히 중요).

- [ ] **Step 6: 커밋**

```bash
git add src/app/contact/ContactPageClient.tsx src/components/contact/ContactFaqSection.tsx src/app/login/page.tsx src/app/signup/page.tsx src/components/login/LoginSocialPanel.tsx src/components/login/OAuthRedirectHelp.tsx src/app/not-found.tsx
git commit -m "feat: 문의·로그인·회원가입·404 페이지 다크모드 대응"
```

---

### Task 8: 최종 검증 (전 라우트 라이트/다크 전수 스윕)

**Files:**
- 코드 변경 없음 (검증 전용 태스크)

**Interfaces:**
- Consumes: `scripts/theme-check.mjs`, Task 1~7에서 토큰화된 모든 페이지.
- Produces: 없음 — 최종 확인 리포트만 작성.

- [ ] **Step 1: 전체 회귀 테스트**

Run: `npx tsc --noEmit` — 타입 에러 없음.
Run: `npm run lint` — 새 에러 없음.
Run: `npm run test` — 전부 통과.
Run: `npm run test:e2e` — 전부 통과(스킵 포함 기존과 동일한 패턴).

- [ ] **Step 2: 하드코딩 색상 전수 재확인**

Run: `grep -rnE "bg-white|text-slate-[0-9]|bg-slate-[0-9]|border-slate-[0-9]" src/app/page.tsx src/app/not-found.tsx src/app/about/page.tsx src/app/solutions/page.tsx src/app/login/page.tsx src/app/signup/page.tsx src/app/contact/ContactPageClient.tsx "src/app/cases/page.tsx" "src/app/cases/[slug]/page.tsx" src/app/blog/page.tsx "src/app/blog/[slug]/page.tsx" "src/app/blog/category/[slug]/page.tsx" src/components/Header.tsx src/components/Footer.tsx src/components/Hero.tsx src/components/CasesPreview.tsx src/components/blog/BlogPostGrid.tsx src/components/blog/BlogShell.tsx src/components/blog/BlogSidebar.tsx src/components/cases/CaseCard.tsx src/components/cases/CaseFilterGrid.tsx src/components/contact/ContactFaqSection.tsx src/components/login/LoginSocialPanel.tsx src/components/login/OAuthRedirectHelp.tsx`
Expected: 매치 없음 (Task 1~7이 모두 끝난 상태라면 24개 파일 전체가 깨끗해야 한다). 매치가 있으면 어느 태스크에서 누락됐는지 찾아 그 태스크 범위에서 마저 고친다.

- [ ] **Step 3: 전 라우트 스크린샷 스윕**

`npm run dev`를 백그라운드로 실행한 뒤, 서버가 준비될 때까지 대기한다:

```bash
until curl -s -o /dev/null -w "%{http_code}" http://localhost:3100/ | grep -q 200; do sleep 1; done
```

Run:
```bash
node scripts/theme-check.mjs / /about /solutions /cases /cases/a-ax /blog /blog/ai /blog/category/customer-stories /contact /login /signup /this-route-does-not-exist
```

Expected: 24개 조합(12라우트 × 2테마) 모두 `[OK]`, exit code 0. `.theme-check/` 아래 스크린샷 12쌍을 훑어보며 다크 모드에서 읽기 힘든 대비(어두운 글자가 어두운 배경 위에 있는 등)가 없는지 최종 육안 확인.

서버 종료: `netstat -ano | grep ":3100" | grep LISTENING`으로 PID 찾아 `taskkill //F //T //PID <PID>` (Windows).

- [ ] **Step 4: 완료 보고**

위 스텝들의 결과(통과 개수, 스크린샷 육안 확인 결과, 발견된 이슈가 있었다면 어떻게 해결했는지)를 정리해 사용자에게 보고한다. 코드 변경이 없으므로 커밋은 생략한다.
