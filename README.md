# CoreDXI 기업 홈페이지

> **(주)코어디엑스아이(CoreDXI)** 의 공식 기업 홈페이지 프로젝트입니다.
> B2B 회의 예약 및 AX(AI 전환) 솔루션을 소개하는 웹사이트입니다.

---

## 프로젝트 소개

CoreDXI는 복잡한 기업 협업을 단순화하고, AI를 통해 비즈니스 핵심을 깨우는 **AX 코어 파트너**입니다.
이 홈페이지는 **채널톡**과 **Loom**의 디자인 철학을 참고하여, 신뢰감 있고 혁신적이면서도 따뜻하고 미니멀한 느낌으로 설계되었습니다.

**브랜드 메인 컬러**: 로열 블루 `#1E4E8C`

---

## 최근 업데이트

| 버전 | 내용 |
|------|------|
| v0.4 | 관리자 등록 & 권한 관리 시스템 추가 (Role enum, /admin 페이지, 미들웨어) |
| v0.3 | 사용자 로그인 UI(/login), Prisma+SQLite 데이터베이스 초기 세팅 |
| v0.2 | Loom 스타일 반응형 헤더(Header.tsx) 추가, 히어로 섹션 고도화(대형 타이포그래피, 버튼 2개, 이미지 플레이스홀더) |
| v0.1 | 프로젝트 초기 세팅 (Next.js 15, Tailwind v4, shadcn/ui), 히어로 섹션 초기 버전, 브랜드 컬러 세팅 |

---

## 로컬 개발 환경 실행 방법

### 1. 사전 준비
- [Node.js](https://nodejs.org) 18.x 이상이 설치되어 있어야 합니다.

### 2. 의존성 설치
```bash
npm install
```

### 3. 개발 서버 시작

> **참고**: 포트 3000이 시스템에 의해 차단된 경우 아래 명령어를 사용하세요.

```bash
# 포트 8080으로 실행 (권장)
npm run dev -- --port 8080 --hostname 127.0.0.1
```

브라우저에서 http://127.0.0.1:8080 을 열면 사이트를 확인할 수 있습니다.
파일을 저장하면 브라우저가 자동으로 새로고침됩니다.

### 4. 기타 명령어
```bash
npm run build   # 프로덕션용 빌드 생성
npm run start   # 프로덕션 빌드 실행
npm run lint    # 코드 품질 검사
```

---

## 기술 스택

| 기술 | 역할 | 버전 |
|------|------|------|
| [Next.js](https://nextjs.org) | React 프레임워크 (App Router) | 15.x |
| [TypeScript](https://www.typescriptlang.org) | 정적 타입 언어 | 5.x |
| [Tailwind CSS](https://tailwindcss.com) | 유틸리티 기반 CSS 프레임워크 | 4.x |
| [shadcn/ui](https://ui.shadcn.com) | 접근성 기반 UI 컴포넌트 라이브러리 | 최신 |
| [React](https://react.dev) | UI 렌더링 라이브러리 | 19.x |

---

## 프로젝트 폴더 구조

```
CoreDXI-Web/
├── src/
│   ├── app/
│   │   ├── admin/                  # ★ 관리자 대시보드 (/admin/*)
│   │   │   ├── layout.tsx          # 사이드바 레이아웃 (로열 블루 사이드바)
│   │   │   ├── page.tsx            # /admin → /admin/users 리다이렉트
│   │   │   ├── actions.ts          # Server Actions: createAdmin, updateUserRole
│   │   │   ├── AdminNav.tsx        # 사이드바 네비게이션 (클라이언트)
│   │   │   ├── register/page.tsx   # 관리자 등록 폼
│   │   │   └── users/
│   │   │       ├── page.tsx        # 관리자 목록 + 권한 변경
│   │   │       └── RoleSelect.tsx  # 권한 드롭다운 (클라이언트)
│   │   ├── login/
│   │   │   └── page.tsx            # 로그인 페이지 (/login)
│   │   ├── globals.css             # 전역 스타일 및 브랜드 컬러 설정 (#1E4E8C)
│   │   ├── layout.tsx              # 공통 레이아웃 (HTML, 폰트, 메타데이터)
│   │   └── page.tsx                # 메인 홈페이지 (/) — Header + Hero 조합
│   ├── components/
│   │   ├── Header.tsx              # 반응형 헤더 (로고, 네비게이션, 버튼, 햄버거 메뉴)
│   │   ├── Hero.tsx                # 히어로 섹션 (첫 화면, 대형 타이포그래피)
│   │   └── ui/                     # shadcn/ui 자동 생성 컴포넌트
│   ├── lib/
│   │   ├── prisma.ts               # ★ Prisma 클라이언트 싱글턴
│   │   └── utils.ts                # 공통 유틸리티 함수
│   ├── generated/prisma/           # Prisma 자동 생성 타입 (직접 수정 금지)
│   └── middleware.ts               # ★ /admin/* 접근 보호 미들웨어
├── prisma/
│   ├── schema.prisma               # ★ 데이터베이스 스키마 (User, Role 등)
│   └── migrations/                 # DB 마이그레이션 이력
├── public/                         # 정적 파일 (이미지 파일을 여기에 넣습니다)
├── .cursorrules                    # AI 코딩 규칙 (Cursor IDE 전용)
├── CONTENT_GUIDE.md                # 홍보팀용 콘텐츠 수정 가이드
└── README.md                       # 이 파일
```

---

## 홍보팀을 위한 빠른 수정 가이드

| 수정 항목 | 파일 위치 | 수정할 변수 |
|-----------|-----------|------------|
| 네비게이션 메뉴 | src/components/Header.tsx | NAV_ITEMS 배열 |
| 헤더 버튼 | src/components/Header.tsx | HEADER_BUTTONS 객체 |
| 히어로 타이틀/부제목 | src/components/Hero.tsx | HERO_CONTENT.title / subtitle |
| 히어로 버튼 | src/components/Hero.tsx | HERO_CONTENT.primaryCtaText 등 |
| 서비스 예시 이미지 | src/components/Hero.tsx | HERO_CONTENT.imageSrc |
| 브라우저 탭 제목 | src/app/layout.tsx | metadata.title |

자세한 설명은 **CONTENT_GUIDE.md** 를 참고하세요.

---

## 최초 SUPER_ADMIN 계정 만들기

서비스를 처음 시작할 때, 아직 로그인 기능이 없으므로 **Prisma Studio**를 통해 직접 최초 SUPER_ADMIN 계정을 설정합니다.

### 방법 1 — Prisma Studio 사용 (권장)

```bash
# 터미널에서 실행
npx prisma studio
```

1. 브라우저에서 `http://localhost:5555` 가 자동으로 열립니다.
2. **User** 모델 테이블을 클릭합니다.
3. 원하는 계정의 `role` 컬럼을 `SUPER_ADMIN`으로 변경합니다.
4. 저장(Save) 버튼을 클릭합니다.

### 방법 2 — 관리자 등록 페이지 사용

next-auth 로그인 연동 전 개발 환경에서는 `/admin/register`에 직접 접근하여 계정을 등록할 수 있습니다.

1. 개발 서버 실행 후 `http://127.0.0.1:8080/admin/register` 접속
2. 이름, 이메일 입력 후 **SUPER_ADMIN** 권한으로 등록

> **[주의]** 프로덕션 환경에서는 반드시 로그인 인증을 완성한 후 관리자 페이지에 접근하도록 설정하세요.

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

> **참고:** 훅 파일(`.git/hooks/post-commit`)은 Git으로 추적되지 않습니다. 다른 PC나 새 clone에서는 `scripts/notion_post_commit.py`와 `.env` 설정 후 훅을 다시 설치해야 합니다.

---

## 개발 팀

- 기술 문의: 개발팀
- 콘텐츠/디자인 문의: 홍보팀