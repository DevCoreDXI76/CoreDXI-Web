# CoreDXI 기업 홈페이지

> **(주)코어디엑스아이(CoreDXI)** 의 공식 기업 홈페이지 프로젝트입니다.
> B2B AX(AI 전환) 솔루션을 소개하고 리드를 확보하는 마케팅 웹사이트 + 관리자 CMS입니다.

---

## 프로젝트 소개

CoreDXI는 복잡한 기업 협업을 단순화하고, AI를 통해 비즈니스 핵심을 깨우는 **AX 코어 파트너**입니다.
이 홈페이지는 **채널톡**과 **Loom**의 디자인 철학을 참고하여, 신뢰감 있고 미니멀한 느낌으로 설계되었습니다.

**브랜드 메인 컬러**: 로열 블루 `#1E4E8C`

자세한 기능 명세는 [`docs/PRD.md`](docs/PRD.md), 구현 현황은 [`docs/TODO.md`](docs/TODO.md)를 참고하세요.

---

## 로컬 개발 환경 실행 방법

### 1. 사전 준비
- [Node.js](https://nodejs.org) 20.x 이상
- Supabase 프로젝트 (PostgreSQL + Storage)

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정

`.env.example`을 복사해 `.env`를 만들고 실제 값을 채워 넣으세요.

```bash
cp .env.example .env
```

주요 환경변수: Supabase(DB/Storage), NextAuth(OAuth·시크릿), Resend(이메일), GA4, Sentry.
각 변수의 용도는 `.env.example`의 주석을 참고하세요.

### 4. 개발 서버 시작

```bash
npm run dev
```

Turbopack으로 **http://localhost:3100** 에서 실행됩니다. 파일을 저장하면 자동으로 새로고침됩니다.

### 5. 기타 명령어
```bash
npm run build       # 프로덕션용 빌드 생성 (prisma generate 포함)
npm run start        # 프로덕션 빌드 실행
npm run lint          # ESLint 코드 품질 검사
npm run test          # Vitest 유닛 테스트 실행
npm run test:watch   # Vitest watch 모드
npm run test:e2e     # Playwright E2E 골든패스 테스트 (dev 서버 자동 기동)
npx tsc --noEmit      # 타입 체크
```

### 6. 최초 관리자 계정 만들기

DB에 관리자 계정이 하나도 없을 때만 `/setup` 페이지에 접근할 수 있습니다.

1. 개발 서버 실행 후 `http://localhost:3100/setup` 접속
2. 이메일·비밀번호 입력 후 SUPER_ADMIN 계정 생성
3. (선택) `.env`에 `SETUP_SECRET`을 설정해두면 추가 확인 토큰 입력이 필요합니다.

이후에는 `/admin/login`에서 로그인합니다.

---

## 기술 스택

| 레이어 | 기술 | 버전 |
|--------|------|------|
| 프레임워크 | [Next.js](https://nextjs.org) (App Router) | 15.5.x |
| UI | [React](https://react.dev) | 19.x |
| 언어 | [TypeScript](https://www.typescriptlang.org) | 5.x |
| 스타일링 | [Tailwind CSS](https://tailwindcss.com) | v4 |
| UI 컴포넌트 | [shadcn/ui](https://ui.shadcn.com) | 최신 |
| ORM / DB | [Prisma](https://www.prisma.io) 7.x + PostgreSQL (Supabase) | - |
| 스토리지 | Supabase Storage (`blog-images` 버킷) | - |
| 인증 | [NextAuth v5 (Auth.js)](https://authjs.dev) — Credentials + Google/Kakao/Naver OAuth | 5.0.0-beta |
| 에디터 | [Tiptap](https://tiptap.dev) (신규) + BlockNote (레거시 호환) | - |
| 이메일 | [Resend](https://resend.com) | - |
| 모니터링 | [Sentry](https://sentry.io) | - |
| 분석 | Google Analytics 4 (gtag + Data API) | - |
| 테스트 | [Vitest](https://vitest.dev) (유닛) + [Playwright](https://playwright.dev) (E2E) | - |
| 배포 | [Vercel](https://vercel.com) | - |

---

## 프로젝트 폴더 구조

```
CoreDXI-Web/
├── src/
│   ├── app/
│   │   ├── (공개 페이지)          # /, /about, /solutions, /cases, /blog, /contact, /terms, /privacy
│   │   ├── login/, signup/        # 일반 회원 로그인·가입 (OAuth + 이메일 OTP)
│   │   ├── setup/                 # 최초 관리자 등록 (DB에 Admin 없을 때만 접근 가능)
│   │   ├── admin/                 # 관리자 CMS (/admin/*) — 대시보드·블로그·성공사례·문의·계정 관리
│   │   ├── api/                   # API Routes (auth, 블로그 이미지 업로드/import 등)
│   │   ├── sitemap.ts, robots.ts  # SEO 자동 생성
│   │   └── layout.tsx             # 공통 레이아웃, 메타데이터, JSON-LD
│   ├── components/                # UI 컴포넌트 (Header, Hero, Footer, 에디터, admin/*, ui/*)
│   ├── lib/                       # 유틸·서비스 레이어 (prisma, auth, seo, resend, supabase 등)
│   ├── actions/                   # Server Actions (contact 등)
│   ├── auth.ts, auth.config.ts    # NextAuth 설정
│   ├── middleware.ts              # /admin/* Role 기반 접근 보호
│   └── generated/prisma/          # Prisma 자동 생성 타입 (직접 수정 금지)
├── e2e/                           # Playwright E2E 골든패스 테스트
├── prisma/
│   ├── schema.prisma              # 데이터베이스 스키마
│   └── migrations/                 # DB 마이그레이션 이력
├── docs/
│   ├── PRD.md                     # 제품 요구사항 명세
│   └── TODO.md                    # 구현 현황 및 향후 계획
├── scripts/                       # Notion 연동용 Python 스크립트 (개발 워크플로, 앱 기능 아님)
├── public/                        # 정적 파일
├── .env.example                   # 환경변수 템플릿
├── CONTENT_GUIDE.md               # 홍보팀용 콘텐츠 수정 가이드
└── README.md                      # 이 파일
```

---

## 홍보팀을 위한 빠른 수정 가이드

콘텐츠(네비게이션, 히어로 문구, 브라우저 탭 제목 등) 수정 방법은 **[CONTENT_GUIDE.md](CONTENT_GUIDE.md)** 를 참고하세요.

블로그·성공사례는 `/admin/blog`, `/admin/portfolio`에서 관리자 CMS로 직접 등록·수정할 수 있습니다.
(홈/회사소개/솔루션 페이지 텍스트는 아직 CMS가 없어 코드 수정이 필요합니다 — `docs/TODO.md` 참고.)

---

## Git 커밋 메시지 규칙 (Notion Tasks 자동 기록)

이 프로젝트에는 **post-commit 훅**이 설치되어 있어, `git commit` 시 Notion Tasks DB에 작업이 자동 기록됩니다.

커밋 메시지는 아래 **Conventional Commits** 형식을 권장합니다:

```
feat: 작업 제목
fix: 작업 제목
refactor: 작업 제목
chore: 작업 제목
docs: 작업 제목
```

- prefix 없이 커밋해도 Tasks에는 기록되지만, **작업 유형** 필드는 비워집니다.
- **사용 도구**는 `.claude` / `.cursor` 폴더의 최근 수정 시각으로 자동 추정됩니다 (Cursor / Claude Code / 기타).
- 수동 지정이 필요하면 `.env`에 `VIBE_CODING_TOOL=Cursor` (또는 `Claude Code`)를 설정하면 자동 감지보다 우선합니다.

> **참고:** 훅 파일(`.git/hooks/post-commit`)은 Git으로 추적되지 않습니다. 다른 PC나 새 clone에서는 `scripts/notion_post_commit.py`와 `.env` 설정 후 `scripts/install_notion_post_commit_hook.sh`로 훅을 다시 설치해야 합니다.

---

## 개발 팀

- 기술 문의: 개발팀
- 콘텐츠/디자인 문의: 홍보팀
