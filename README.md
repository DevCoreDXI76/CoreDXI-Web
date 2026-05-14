# CoreDXI 기업 홈페이지

> **(주)코어디엑스아이(CoreDXI)** 의 공식 기업 홈페이지 프로젝트입니다.  
> B2B 회의 예약 및 AX(AI 전환) 솔루션을 소개하는 웹사이트입니다.

---

## 프로젝트 소개

CoreDXI는 복잡한 기업 협업을 단순화하고, AI를 통해 비즈니스 핵심을 깨우는 **AX 코어 파트너**입니다.  
이 홈페이지는 채널톡과 Loom의 디자인 철학을 참고하여, 신뢰감 있고 혁신적이면서도 따뜻하고 미니멀한 느낌으로 설계되었습니다.

**브랜드 메인 컬러**: 로열 블루 `#1E4E8C`

---

## 로컬 개발 환경 실행 방법

### 1. 사전 준비
- [Node.js](https://nodejs.org) 18.x 이상이 설치되어 있어야 합니다.

### 2. 의존성 설치
```bash
npm install
```

### 3. 개발 서버 시작
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 열면 사이트를 확인할 수 있습니다.  
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
│   │   ├── globals.css      # 전역 스타일 및 브랜드 컬러 설정
│   │   ├── layout.tsx       # 공통 레이아웃 (HTML, 폰트, 메타데이터)
│   │   └── page.tsx         # 메인 홈페이지 (/ 경로)
│   ├── components/
│   │   ├── Hero.tsx         # 히어로 섹션 (첫 화면)
│   │   └── ui/              # shadcn/ui 자동 생성 컴포넌트
│   └── lib/
│       └── utils.ts         # 공통 유틸리티 함수
├── public/                  # 정적 파일 (이미지, 아이콘 등)
├── .cursorrules             # AI 코딩 규칙 (Cursor IDE 전용)
├── CONTENT_GUIDE.md         # 홍보팀용 콘텐츠 수정 가이드
└── README.md                # 이 파일
```

---

## 콘텐츠 수정 가이드

홍보팀 등 비개발자를 위한 콘텐츠 수정 방법은 **[CONTENT_GUIDE.md](./CONTENT_GUIDE.md)** 를 참고하세요.

---

## 개발 팀

- 기술 문의: 개발팀
- 콘텐츠/디자인 문의: 홍보팀
