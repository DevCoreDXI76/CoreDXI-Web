/**
 * Hero.tsx — 히어로 섹션 (첫 화면)
 *
 * 이 파일은 홈페이지에서 처음 보이는 '히어로(Hero)' 섹션입니다.
 * 회사 소개 문구, 서브 타이틀, 솔루션 문의 버튼으로 구성되어 있습니다.
 *
 * [홍보팀 수정 안내]
 * ─────────────────────────────────────────────────────────────────
 * ✏️  텍스트 수정: 아래 HERO_CONTENT 객체의 값들을 수정하세요.
 * 🔗  버튼 링크:  ctaHref 값을 수정하면 버튼 클릭 시 이동 경로가 바뀝니다.
 * ─────────────────────────────────────────────────────────────────
 */

/* =====================================================
   [홍보팀] 콘텐츠 수정 구역 — 여기만 수정하면 됩니다!
   아래 HERO_CONTENT 객체 안의 텍스트를 원하는 내용으로 바꾸세요.
   ===================================================== */
const HERO_CONTENT = {
  /** [홍보팀] 화면 상단에 표시되는 작은 뱃지 문구입니다. */
  badge: "AI 기반 AX 전환 솔루션",

  /** [홍보팀] 가장 크게 표시되는 메인 타이틀입니다. 임팩트 있는 한 문장으로 작성하세요. */
  title: "비즈니스의 중심(Core)을\nAI로 깨우다.",

  /** [홍보팀] 메인 타이틀 아래에 표시되는 서브 타이틀(부제목)입니다. */
  subtitle:
    "복잡한 협업은 심플하게, 변화는 단단하게 설계하는\n당신의 AX 코어 파트너, CoreDXI",

  /** [홍보팀] 버튼 위에 표시되는 보조 안내 문구입니다. 짧게 작성하세요. */
  supportingText: "지금 바로 CoreDXI와 함께 AI 전환을 시작하세요.",

  /** [홍보팀] 주요 CTA(Call To Action) 버튼 텍스트입니다. */
  ctaText: "솔루션 도입 문의",

  /**
   * [홍보팀] 버튼 클릭 시 이동할 링크 주소입니다.
   * - 내부 페이지: "/문의하기" 처럼 /로 시작하는 경로를 입력하세요.
   * - 외부 사이트: "https://www.example.com" 처럼 전체 주소를 입력하세요.
   */
  ctaHref: "/contact",

  /** [홍보팀] 보조 링크 텍스트입니다 (버튼 옆 텍스트 링크). */
  secondaryCtaText: "서비스 소개 보기 →",

  /** [홍보팀] 보조 링크 클릭 시 이동할 주소입니다. */
  secondaryCtaHref: "/about",
};

/* =====================================================
   이 아래는 개발 코드입니다. 수정 시 개발팀에 문의하세요.
   ===================================================== */

/**
 * Hero 컴포넌트
 * 홈페이지의 첫 화면 전체를 차지하는 히어로 섹션을 렌더링합니다.
 */
export function Hero() {
  return (
    /*
     * 히어로 섹션 전체 컨테이너
     * - 화면 전체 높이(min-h-screen) 사용
     * - 콘텐츠를 가로/세로 정중앙에 배치
     * - 배경: 따뜻한 그라데이션 (흰색 → 연한 블루 그레이)
     */
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background to-secondary/30 px-6 py-24 text-center">
      {/* 배경 장식 요소: 부드러운 블루 글로우 효과 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center"
      >
        <div className="h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* 콘텐츠 최대 너비 제한 컨테이너 */}
      <div className="mx-auto max-w-4xl space-y-8">

        {/* ─── 뱃지 ─────────────────────────────────────────── */}
        {/* [홍보팀] 타이틀 위 작은 뱃지입니다. HERO_CONTENT.badge 값을 수정하세요. */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5 text-sm font-medium text-primary">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
          {HERO_CONTENT.badge}
        </div>

        {/* ─── 메인 타이틀 ───────────────────────────────────── */}
        {/*
         * [홍보팀] 가장 크게 표시되는 핵심 문구입니다.
         * HERO_CONTENT.title 값을 수정하세요.
         * \n 은 줄 바꿈을 의미합니다.
         */}
        <h1 className="whitespace-pre-line text-5xl font-extrabold leading-tight tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          {HERO_CONTENT.title.split("\n").map((line, index) => (
            <span key={index}>
              {index === 0 ? (
                /* 첫 번째 줄: 브랜드 컬러 강조 */
                <span className="text-primary">{line}</span>
              ) : (
                line
              )}
              {index < HERO_CONTENT.title.split("\n").length - 1 && <br />}
            </span>
          ))}
        </h1>

        {/* ─── 서브 타이틀 ───────────────────────────────────── */}
        {/*
         * [홍보팀] 메인 타이틀 아래에 표시되는 부제목입니다.
         * HERO_CONTENT.subtitle 값을 수정하세요.
         */}
        <p className="mx-auto max-w-2xl whitespace-pre-line text-lg leading-relaxed text-muted-foreground sm:text-xl">
          {HERO_CONTENT.subtitle}
        </p>

        {/* ─── 보조 안내 문구 ─────────────────────────────────── */}
        {/* [홍보팀] 버튼 위 짧은 안내 문구입니다. HERO_CONTENT.supportingText 값을 수정하세요. */}
        <p className="text-sm font-medium text-muted-foreground/80">
          {HERO_CONTENT.supportingText}
        </p>

        {/* ─── CTA 버튼 그룹 ──────────────────────────────────── */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">

          {/*
           * [홍보팀] 주요 CTA 버튼입니다.
           * - 버튼 텍스트: HERO_CONTENT.ctaText 값을 수정하세요.
           * - 이동 링크: HERO_CONTENT.ctaHref 값을 수정하세요.
           *   예) "/contact" → 내부 문의 페이지
           *   예) "https://calendly.com/coredxi" → 외부 예약 링크
           */}
          <a
            href={HERO_CONTENT.ctaHref}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-200 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:translate-y-0"
          >
            {HERO_CONTENT.ctaText}
            {/* 버튼 우측 화살표 아이콘 */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </a>

          {/*
           * [홍보팀] 보조 텍스트 링크입니다.
           * - 링크 텍스트: HERO_CONTENT.secondaryCtaText 값을 수정하세요.
           * - 이동 링크: HERO_CONTENT.secondaryCtaHref 값을 수정하세요.
           */}
          <a
            href={HERO_CONTENT.secondaryCtaHref}
            className="inline-flex items-center text-base font-medium text-primary transition-all duration-200 hover:text-primary/80 hover:underline hover:underline-offset-4"
          >
            {HERO_CONTENT.secondaryCtaText}
          </a>
        </div>

        {/* ─── 신뢰 지표 ──────────────────────────────────────── */}
        {/*
         * [홍보팀] 하단에 표시되는 신뢰 문구 영역입니다.
         * 아래 숫자와 설명 텍스트를 실제 데이터에 맞게 수정하세요.
         */}
        <div className="flex flex-col items-center gap-6 pt-4 sm:flex-row sm:justify-center sm:gap-12">
          {/* [홍보팀] 신뢰 지표 1: 숫자와 설명을 수정하세요 */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-foreground">50+</span>
            <span className="text-sm text-muted-foreground">도입 기업</span>
          </div>
          {/* 구분선 */}
          <div className="hidden h-8 w-px bg-border sm:block" aria-hidden="true" />
          {/* [홍보팀] 신뢰 지표 2: 숫자와 설명을 수정하세요 */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-foreground">98%</span>
            <span className="text-sm text-muted-foreground">고객 만족도</span>
          </div>
          {/* 구분선 */}
          <div className="hidden h-8 w-px bg-border sm:block" aria-hidden="true" />
          {/* [홍보팀] 신뢰 지표 3: 숫자와 설명을 수정하세요 */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-foreground">3배</span>
            <span className="text-sm text-muted-foreground">업무 효율 향상</span>
          </div>
        </div>
      </div>

      {/* 하단 스크롤 유도 애니메이션 */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-muted-foreground/50"
        aria-hidden="true"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </section>
  );
}
