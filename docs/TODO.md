# CoreDXI-Web TODO

> 최종 업데이트: 2026-06-30
> 코드베이스 분석 기반 — 실제 구현 상태를 반영합니다.

---

## 범례

| 아이콘 | 의미 |
|--------|------|
| ✅ | 완료 |
| 🚧 | 진행 중 / 부분 구현 |
| ⬜ | 미구현 (플레이스홀더) |
| 🔧 | 개선 필요 |
| 💡 | 향후 계획 / 아이디어 |

---

## 1. 완료된 기능 ✅

### 공개 마케팅 페이지

- ✅ 홈 페이지 (`/`) — 히어로, 성공사례 미리보기, 최신 블로그, Mini About CTA
- ✅ 회사 소개 (`/about`) — 미션·핵심가치·KPI 수치·CTA, SEO 메타데이터
- ✅ 솔루션 소개 (`/solutions`) — 솔루션 3종 카드, 4단계 도입 프로세스
- ✅ 성공사례 목록 (`/cases`) — Prisma DB 기반 카드 그리드
- ✅ 성공사례 상세 (`/cases/[id]`) — 동영상 embed, 동적 SEO 메타데이터
- ✅ 블로그 목록 (`/blog`) — 발행 글 목록, URL 검색 필터(`?q=`)
- ✅ 블로그 상세 (`/blog/[slug]`) — Tiptap/BlockNote 본문 렌더, JSON-LD
- ✅ 블로그 카테고리 (`/blog/category/[slug]`) — 카테고리별 필터링
- ✅ 문의하기 (`/contact`) — 폼 제출, Supabase 저장, Resend 알림 이메일
- ✅ 이용약관 (`/terms`), 개인정보처리방침 (`/privacy`)

### 인증 시스템

- ✅ 일반 회원 로그인 (`/login`) — Google·Kakao·Naver OAuth, 이메일 2단계
- ✅ 회원가입 (`/signup`) — 이메일 OTP 인증(6자리, 5분 만료) 3단계 플로우
- ✅ 관리자 로그인 (`/admin/login`) — Credentials 인증
- ✅ 최초 관리자 설정 (`/setup`) — DB Admin 없을 때만 접근
- ✅ OAuth 리다이렉트 URI 안내 컴포넌트 (`OAuthRedirectHelp`)
- ✅ 잘못된 쿠키 초기화 API (`/api/auth/reset`)
- ✅ 환경 진단 API (`/api/auth/health`)

### 관리자 CMS 패널

- ✅ 대시보드 (`/admin/dashboard`) — 통계 카드, GA4 분석 패널, 퀵액션, 활동 로그
- ✅ 성공사례 관리 (`/admin/portfolio`) — 목록·신규 등록·수정·삭제
- ✅ 블로그 관리 (`/admin/blog`) — 글 목록·신규 작성·수정·발행 상태 관리
- ✅ 블로그 주제 관리 (`/admin/blog/topics`) — 카테고리 CRUD
- ✅ 문의 관리 (`/admin/contact`) — 문의 목록·상태 변경·알림 이메일 설정
- ✅ 관리자 계정 관리 (`/admin/users`) — 목록·Role 변경(SUPER_ADMIN/EDITOR/VIEWER)
- ✅ 관리자 등록 (`/admin/register`)
- ✅ 고객(일반 회원) 관리 (`/admin/customers`) — 목록·상세·수정·삭제
- ✅ 설정 허브 (`/admin/settings`)

### 인프라 & 품질

- ✅ Next.js 미들웨어 기반 관리자 라우트 Role 보호 (`src/middleware.ts`)
- ✅ Sentry 에러 모니터링 연동 (`withSentryConfig`, `instrumentation.ts`)
- ✅ GA4 Data API 연동 (관리자 대시보드 실시간 지표)
- ✅ Supabase Storage 블로그 이미지 업로드·외부 URL import (SSRF 방지 포함)
- ✅ `sitemap.ts`, `robots.ts` 자동 생성
- ✅ OG 이미지 자동 생성 (`opengraph-image.tsx`) — 루트·블로그·성공사례
- ✅ `coredxi.com` → `www.coredxi.com` 301 리다이렉트
- ✅ Tiptap / BlockNote 듀얼 포맷 지원 (신규: Tiptap, 레거시: BlockNote 호환 렌더)
- ✅ 비개발자용 `CONTENT_GUIDE.md` 작성 (홍보팀 가이드)
- ✅ 브랜드 컬러·디자인 시스템 (`globals.css`, `--primary: #1E4E8C`)

---

## 2. 미구현 / 플레이스홀더 ⬜

> 관리자 패널 메뉴는 존재하지만 실제 기능은 `AdminPlaceholder` 컴포넌트로 대체된 항목들입니다.

- ⬜ **홈 페이지 CMS** (`/admin/main`) — 히어로 섹션 텍스트·이미지 관리자 편집 기능
  - 현재: `Hero.tsx`의 `HERO_CONTENT` 객체를 코드에서 직접 수정해야 함
- ⬜ **회사소개 CMS** (`/admin/about`) — About 페이지 콘텐츠 DB 연동 편집
  - 현재: `src/app/about/page.tsx` 내 정적 하드코딩
- ⬜ **솔루션 CMS** (`/admin/solutions`) — Solutions 페이지 카드·텍스트 관리자 편집
  - 현재: `src/app/solutions/page.tsx` 내 정적 하드코딩
- ⬜ **Notion API 실제 연동** — 환경변수 7개(`NOTION_*_DB_ID`) 존재하지만 앱 내 실제 사용처 미확인
  - `NOTION_PROJECTS_DB_ID`, `NOTION_DOCUMENTS_DB_ID`, `NOTION_TASKS_DB_ID` 등

---

## 3. 개선이 필요한 항목 🔧

### 보안

- 🔧 `.env` 파일 보안 점검 — 프로덕션 키가 평문 저장되어 있어 Git 커밋 여부 재확인 필요 (`.gitignore` 검토)
- 🔧 Supabase Service Role Key 서버 전용 사용 확인 — 클라이언트에 노출되지 않도록 주의
- 🔧 OTP 코드 사용 후 즉시 무효화 로직 재검토

### 문서화

- 🔧 `README.md` 현행화 — 현재 `npm` 기준 문서이나 실제 프로젝트는 `pnpm`, Turbopack, 포트 3100, Supabase, Sentry, GA4 등으로 크게 확장됨
- 🔧 `README.md` 기술 스택 표 업데이트 (Next.js 15.5, React 19, Prisma 7, NextAuth v5 등)
- 🔧 환경변수 설명 문서화 (`.env.example` 파일 생성 — 실제 값 없이 키 이름만 기록)

### 코드 품질

- 🔧 `mock-data.ts` (`src/components/admin/dashboard/mock-data.ts`) — 실제 데이터 조회로 교체 여부 확인
- 🔧 BlockNote 레거시 에디터 의존성 정리 계획 수립 — 장기적으로 Tiptap 단일화 고려
- 🔧 `/admin/inquiries` → `/admin/contact` 구 경로 리다이렉트는 일정 기간 후 제거 가능
- 🔧 `/concepts` 페이지 (`noindex`) — 내부 디자인 시안 페이지, 프로덕션 배포 전 제거 또는 접근 제한 검토

### UX·성능

- 🔧 홈 페이지(`/`) `force-dynamic` 적용 — 필요시 ISR(Incremental Static Regeneration)으로 전환하여 성능 개선
- 🔧 블로그 상세 페이지 `generateStaticParams()` 적용 검토 (발행 글 사전 빌드)
- 🔧 GA4 대시보드 패널 로딩 상태 처리 개선

---

## 4. 향후 계획 💡

### 단기 (1~2개월)

- 💡 **홈·소개·솔루션 CMS 구현** — `AdminPlaceholder` 세 페이지에 실제 DB 연동 편집 기능 추가
- 💡 **`.env.example` 파일 생성** — 신규 개발자 온보딩 편의성 향상
- 💡 **`README.md` 전면 개정** — 현재 구현 상태 반영
- 💡 **Notion API 활용 계획 수립** — 환경변수로만 존재하는 Notion 연동의 실제 사용처 정의 (예: 프로젝트 관리 대시보드, 배포 로그)

### 중기 (3~6개월)

- 💡 **검색 기능 고도화** — 블로그 전문 검색 (현재는 제목 필터만 제공), Algolia 또는 Postgres full-text search 연동
- 💡 **성공사례 필터링** — 업종·솔루션 유형별 필터 추가
- 💡 **뉴스레터 구독** — 블로그 독자 이메일 구독 기능 (Resend Audiences 활용)
- 💡 **댓글/반응 기능** — 블로그 글에 좋아요 또는 댓글 기능
- 💡 **소셜 메타태그 강화** — 블로그·성공사례별 Twitter Card 커스텀 이미지
- 💡 **관리자 활동 로그 DB 연동** — 현재 `mock-data.ts` 기반인 활동 로그를 실제 DB 기록으로 전환
- 💡 **다크 모드 완성** — `globals.css`에 `.dark` 변수 정의되어 있으나 토글 UI 미제공

### 장기 (6개월+)

- 💡 **회원 전용 콘텐츠 영역** — 로그인 회원에게만 공개되는 심화 자료·리포트 페이지
- 💡 **예약/미팅 시스템** — AX 컨설팅 상담 예약 기능 (Calendly 연동 또는 자체 구현)
- 💡 **다국어(i18n) 지원** — 영문 버전 추가 (글로벌 B2B 확장 대비)
- 💡 **BlockNote → Tiptap 완전 마이그레이션** — 레거시 에디터 의존성 제거
- 💡 **CI/CD 파이프라인 강화** — GitHub Actions lint/test/build 자동화
- 💡 **E2E 테스트 추가** — Playwright 기반 주요 유저 플로우(문의 제출, 관리자 로그인 등) 자동화

---

## 5. 알려진 이슈

| 이슈 | 설명 | 우선순위 |
|------|------|----------|
| README 버전 불일치 | README가 `npm` + 포트 8080 기준이나 실제는 `pnpm` + 포트 3100 + Turbopack | 낮음 |
| `/concepts` 노출 | noindex이지만 URL 직접 접근 가능 — 내부 시안 페이지 | 낮음 |
| 홈 `force-dynamic` | SSG/ISR 미활용으로 인한 불필요한 서버 렌더링 | 중간 |
| Notion 환경변수 미사용 | 7개 Notion DB ID 환경변수가 존재하나 앱 내 활용 코드 없음 | 낮음 |
| `mock-data.ts` | 대시보드 활동 로그가 목업 데이터 | 중간 |

---

## 6. 의존성 관리 메모

- `@tiptap/*` 패키지는 `package.json` `overrides`로 `3.13.0`에 고정 (버전 충돌 방지) — 업그레이드 시 주의
- `next-auth`는 `5.0.0-beta.31` 베타 버전 — 정식 출시 시 마이그레이션 검토
- `prisma`는 `7.x` — 주요 버전 업 시 마이그레이션 스크립트 필요
