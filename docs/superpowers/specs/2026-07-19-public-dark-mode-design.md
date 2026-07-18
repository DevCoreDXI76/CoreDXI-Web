# 공개 페이지 다크모드 지원 설계

## 배경

`docs/TODO.md`는 "다크 모드 완성 — `globals.css`에 `.dark` 변수는 정의되어 있으나 토글 UI 미제공"이라고 기록했지만, 실제 조사 결과 범위가 더 크다. `.dark` 색상 팔레트(`--background`, `--foreground`, `--card`, `--muted`, `--border` 등)는 `src/app/globals.css`에 완성되어 있고 `next-themes`(`^0.4.6`)도 이미 의존성에 있지만:

- 앱을 감싸는 `ThemeProvider`가 어디에도 없다 (`next-themes`는 설치만 되어 있고 미사용 — `src/components/ui/sonner.tsx`가 `useTheme()`을 호출하지만 Provider 없이는 동작하지 않는다).
- 공개 페이지를 구성하는 24개 파일이 `bg-white`, `text-slate-600` 같은 하드코딩된 라이트 전용 Tailwind 색상 클래스를 쓰고 있어, CSS 변수 기반 `.dark` 팔레트가 적용되지 않는다.

토글 버튼만 추가하면 shadcn 기본 컴포넌트(변수 기반) 일부만 어두워지고 Header/Footer/본문은 그대로 하얗게 남아 화면이 반쪽만 바뀐 것처럼 보인다. 이 스펙은 인프라(ThemeProvider) 추가 + 24개 파일 색상 토큰화 + 토글 UI를 함께 다룬다.

## 목표

- 공개 페이지 24개(+ 공용 컴포넌트)가 라이트/다크 모두에서 일관되게 렌더링된다.
- Header에 토글 버튼을 추가해 사용자가 명시적으로 전환할 수 있다.
- 기본값은 항상 라이트 — 방문자의 OS 다크모드 설정과 무관하게 첫 진입은 라이트로 보인다.
- 선택한 테마는 재방문 시에도 유지된다(로컬 저장).

## 비목표

- 다음은 이번 스펙 범위에서 **제외**한다 (사용자와 합의):
  - `/concepts` — 프로덕션에서 미들웨어로 접근 차단된 개발자용 디자인 시안 페이지
  - `src/components/editor/{BlockEditor,BlockEditorInner,TiptapEditor,TiptapEditorInner}.tsx` — `/admin` 경로가 아니지만 관리자 전용 블로그 에디터 도구
  - `src/app/setup/{setup-db-error,setup-form}.tsx` — DB에 관리자 계정이 하나도 없을 때만 접근 가능한 일회성 초기 설치 화면
- 관리자 패널(`src/app/admin/**`)의 다크모드는 이번 스펙 범위 밖이다 (별도 후속 작업으로 남긴다).
- 브랜드 컬러 자체를 바꾸는 것이 아니다 — 이미 정의된 `.dark` 팔레트를 그대로 사용한다.

## 메커니즘

### 1. ThemeProvider 추가

`src/components/theme-provider.tsx` 신규 생성 — `next-themes`의 `ThemeProvider`를 얇게 감싼 클라이언트 컴포넌트:

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

`src/app/layout.tsx`의 `<html>`에 `suppressHydrationWarning`을 추가하고, `<body>` 내부를 `ThemeProvider`로 감싼다:

```tsx
<ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
  {children}
</ThemeProvider>
```

- `attribute="class"` — `.dark` 클래스를 `<html>`에 붙이는 방식(이미 `globals.css`가 이 방식을 전제로 작성됨)
- `defaultTheme="light"`, `enableSystem={false}` — OS 설정과 무관하게 항상 라이트로 시작(합의된 요구사항)

### 2. 토글 버튼

`src/components/ThemeToggle.tsx` 신규 생성 — lucide-react `Sun`/`Moon` 아이콘, `useTheme()`으로 전환. 마운트 전에는 `next-themes`가 테마를 알 수 없으므로(SSR mismatch 방지) `mounted` 상태로 첫 렌더를 스킵하는 표준 패턴을 쓴다.

`Header.tsx`에 배치:
- 데스크탑: 로그인 버튼 왼쪽(또는 바로 옆)에 아이콘 버튼으로
- 모바일 메뉴: 네비게이션 링크 아래, 로그인/도입문의 버튼 위에 한 줄로

### 3. 색상 토큰화 (24개 파일)

하드코딩된 Tailwind 클래스를 `globals.css`에 이미 정의된 CSS 변수 기반 클래스로 교체한다. 파일마다 문맥에 따라 판단이 필요하지만 기본 매핑은 다음과 같다:

| 하드코딩 | 교체 | 용도 |
|---|---|---|
| `bg-white` (페이지/헤더 배경) | `bg-background` | 페이지 최상위 배경 |
| `bg-white` (카드/패널 표면) | `bg-card` | 카드처럼 배경 위에 뜬 표면 |
| `text-slate-900`, `text-slate-800` | `text-foreground` | 본문 강조 텍스트 |
| `text-slate-600`, `text-slate-500` | `text-muted-foreground` | 보조/설명 텍스트 |
| `bg-slate-100`, `bg-slate-50` | `bg-muted` 또는 `bg-accent` | 옅은 배경(hover, 섹션 구분) |
| `border-slate-200`, `border-slate-200/60` | `border-border` | 테두리 |

대상 파일:
- 페이지: `src/app/{page,not-found}.tsx`, `src/app/about/page.tsx`, `src/app/solutions/page.tsx`, `src/app/login/page.tsx`, `src/app/signup/page.tsx`, `src/app/contact/ContactPageClient.tsx`, `src/app/cases/page.tsx`, `src/app/cases/[slug]/page.tsx`, `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx`, `src/app/blog/category/[slug]/page.tsx`
- 공용 컴포넌트: `src/components/{Header,Footer,Hero,CasesPreview}.tsx`, `src/components/blog/{BlogPostGrid,BlogShell,BlogSidebar}.tsx`, `src/components/cases/{CaseCard,CaseFilterGrid}.tsx`, `src/components/contact/ContactFaqSection.tsx`, `src/components/login/{LoginSocialPanel,OAuthRedirectHelp}.tsx`

의미가 애매하거나 변수로 매끄럽게 안 옮겨지는 색(그라디언트, 이미지 오버레이 등)은 억지로 토큰화하지 않고 `dark:` variant를 targeted하게 붙이는 것을 허용한다 — 단, 이런 예외는 파일별로 최소화한다.

## 검증

라이트 모드와 다크 모드 각각에서 24개 페이지(대표 라우트)를 Playwright로 순회해 스크린샷을 남기고, 콘솔 에러가 없는지 확인한다. 기존 Vitest/Playwright 스위트는 색상 클래스와 무관하므로 회귀 없이 그대로 통과해야 한다.

## 영향 범위

- 신규: `src/components/theme-provider.tsx`, `src/components/ThemeToggle.tsx`
- 수정: `src/app/layout.tsx`, `src/components/Header.tsx`, 위에 나열된 24개 파일
- DB 마이그레이션 없음, 새 의존성 없음(`next-themes`, `lucide-react` 모두 이미 설치됨)
