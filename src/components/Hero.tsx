/**
 * Hero.tsx — 히어로 섹션 (첫 화면)
 *
 * 홈페이지에서 헤더 바로 아래에 표시되는 메인 소개 섹션입니다.
 * Loom.com 스타일의 대담한 타이포그래피와 미니멀한 레이아웃을 적용했습니다.
 *
 * ── 변경 이력 ──────────────────────────────────────────────────────
 * v0.2  2026-05-14  Loom 스타일 고도화
 *       - 타이포그래피 확대: text-5xl → text-8xl (Loom 스타일 과감한 크기)
 *       - tracking-tighter 적용, 브랜드 컬러 그라데이션 타이틀
 *       - CTA 버튼 2개로 변경: Solid primary + Outline secondary
 *       - 서비스 예시 이미지 플레이스홀더 추가 (16:9, 점선 테두리)
 *       - imageSrc 설정 시 Next.js Image 컴포넌트로 자동 전환
 *       - stats 배열로 신뢰 지표 추상화
 *       - min-h-[calc(100vh-4rem)] 로 헤더 높이 고려한 레이아웃 조정
 * v0.1  2026-05-14  최초 생성
 *       - HERO_CONTENT 객체 패턴으로 홍보팀 수정 편의성 확보
 *       - 뱃지, 타이틀, 서브타이틀, 버튼, 신뢰 지표 구성
 * ────────────────────────────────────────────────────────────────────
 *
 * [홍보팀 수정 안내]
 * ─────────────────────────────────────────────────────────────────
 * ✏️  텍스트 수정: 아래 HERO_CONTENT 객체의 값들을 수정하세요.
 * 🖼️  이미지 교체: HERO_CONTENT.imageSrc 값을 실제 이미지 파일 경로로 바꾸세요.
 *               이미지 파일은 반드시 public/ 폴더 안에 넣어야 합니다.
 * 🔗  버튼 링크: primaryCtaHref / secondaryCtaHref 값을 수정하세요.
 * ─────────────────────────────────────────────────────────────────
 */

import Image from "next/image";

/* =====================================================
   [홍보팀] 콘텐츠 수정 구역 — 여기만 수정하면 됩니다!
   아래 HERO_CONTENT 객체 안의 값들을 원하는 내용으로 바꾸세요.
   ===================================================== */
const HERO_CONTENT = {
  /** [홍보팀] 타이틀 위 작은 뱃지 문구입니다. */
  badge: "AI 기반 AX 전환 솔루션",

  /**
   * [홍보팀] 가장 크게 표시되는 메인 타이틀입니다.
   * \n 은 줄 바꿈입니다. 임팩트 있는 한 문장으로 작성하세요.
   */
  title: "비즈니스의 중심(Core)을\nAI로 깨우다.",

  /**
   * [홍보팀] 메인 타이틀 아래 부제목입니다.
   * 서비스를 한 문장으로 설명하는 내용을 넣으세요.
   */
  subtitle:
    "복잡한 협업은 심플하게, 변화는 단단하게 설계하는\n당신의 AX 코어 파트너, CoreDXI",

  /**
   * [홍보팀] 주요 버튼(진한 파란색)의 텍스트입니다.
   */
  primaryCtaText: "솔루션 도입 문의",

  /**
   * [홍보팀] 주요 버튼 클릭 시 이동할 주소입니다.
   * 예) "/contact" → 내부 문의 페이지
   * 예) "https://calendly.com/coredxi" → 외부 예약 링크
   */
  primaryCtaHref: "/contact",

  /**
   * [홍보팀] 보조 버튼(테두리 스타일)의 텍스트입니다.
   */
  secondaryCtaText: "서비스 소개 보기",

  /**
   * [홍보팀] 보조 버튼 클릭 시 이동할 주소입니다.
   */
  secondaryCtaHref: "/about",

  /**
   * [홍보팀] 서비스 예시 이미지 경로입니다.
   *
   * 이미지를 교체하는 방법:
   * 1. 사용할 이미지 파일을 'public/' 폴더 안에 복사합니다.
   *    예: public/service-preview.png
   * 2. 아래 값을 파일 이름으로 수정합니다.
   *    예: "/service-preview.png"
   * 3. 이미지가 없으면 null로 설정하면 플레이스홀더가 표시됩니다.
   *    예: null
   */
  imageSrc: null as string | null,

  /** [홍보팀] 이미지의 내용을 설명하는 대체 텍스트입니다 (접근성, SEO에 중요). */
  imageAlt: "CoreDXI 서비스 화면 예시",

  /** [홍보팀] 신뢰 지표 — 실제 데이터로 업데이트하세요. */
  stats: [
    { value: "50+",  label: "도입 기업" },
    { value: "98%",  label: "고객 만족도" },
    { value: "3배",  label: "업무 효율 향상" },
  ],
} as const;

/* =====================================================
   이 아래는 개발 코드입니다. 수정 시 개발팀에 문의하세요.
   ===================================================== */

/**
 * Hero 컴포넌트
 * 홈페이지의 첫 화면 히어로 섹션을 렌더링합니다.
 */
export function Hero() {
  /* 타이틀 줄 나누기 처리 */
  const titleLines = HERO_CONTENT.title.split("\n");

  return (
    /*
     * 히어로 섹션 컨테이너
     * - 헤더 높이(4rem)만큼 상단 패딩
     * - 전체 뷰포트 높이 이상 사용
     */
    <section
      className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center overflow-hidden bg-white px-6 pt-28 pb-16 text-center"
      aria-labelledby="hero-title"
    >
      {/* 배경 장식: 미세한 그리드 패턴 */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
        {/* 그리드가 하단으로 갈수록 페이드 아웃되도록 마스크 추가 */}
        <div className="absolute inset-0 bg-white [mask-image:linear-gradient(180deg,transparent,rgba(255,255,255,0.9)_80%)]"></div>
      </div>

      {/* 콘텐츠 컨테이너: 최대 너비 5xl */}
      <div className="mx-auto w-full max-w-5xl space-y-8">

        {/* ─── 뱃지 ─────────────────────────────────────────── */}
        {/* [홍보팀] 타이틀 위 뱃지. HERO_CONTENT.badge 수정 */}
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-transparent px-4 py-1.5 text-sm font-semibold text-slate-600 shadow-sm">
          {HERO_CONTENT.badge}
        </div>

        {/* ─── 메인 타이틀 ───────────────────────────────────── */}
        {/*
         * [홍보팀] 가장 크게 보이는 메인 문구입니다.
         * HERO_CONTENT.title 값을 수정하세요.
         */}
        <h1
          id="hero-title"
          className="text-5xl font-extrabold leading-[1.05] tracking-tighter text-slate-900 sm:text-6xl lg:text-7xl xl:text-8xl"
        >
          {titleLines.map((line, i) => (
            <span key={i} className="block">
              {i === 0 ? (
                /* 첫 번째 줄에 브랜드 컬러 그라데이션 */
                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {line}
                </span>
              ) : (
                <span className="text-foreground">{line}</span>
              )}
            </span>
          ))}
        </h1>

        {/* ─── 서브 타이틀 ───────────────────────────────────── */}
        {/*
         * [홍보팀] 메인 타이틀 아래 부제목입니다.
         * HERO_CONTENT.subtitle 값을 수정하세요.
         */}
        <p className="mx-auto max-w-2xl whitespace-pre-line text-lg leading-relaxed text-slate-500 sm:text-xl lg:text-2xl">
          {HERO_CONTENT.subtitle}
        </p>

        {/* ─── CTA 버튼 그룹 (2개) ───────────────────────────── */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">

          {/*
           * [홍보팀] 주요 버튼 (진한 파란색)
           * HERO_CONTENT.primaryCtaText / primaryCtaHref 수정
           */}
          <a
            href={HERO_CONTENT.primaryCtaHref}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-8 py-4 text-base font-semibold text-white shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] transition-all duration-200 hover:bg-primary/90 hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:translate-y-0 sm:w-auto"
          >
            {HERO_CONTENT.primaryCtaText}
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </svg>
          </a>

          {/*
           * [홍보팀] 보조 버튼 (테두리 스타일)
           * HERO_CONTENT.secondaryCtaText / secondaryCtaHref 수정
           */}
          <a
            href={HERO_CONTENT.secondaryCtaHref}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:translate-y-0 sm:w-auto"
          >
            {HERO_CONTENT.secondaryCtaText}
          </a>
        </div>

        {/* ─── 서비스 예시 이미지 / 플레이스홀더 ────────────────── */}
        {/*
         * [홍보팀] 서비스 화면 이미지를 표시하는 영역입니다.
         * - 이미지가 없으면 점선 테두리 플레이스홀더가 표시됩니다.
         * - 이미지를 추가하려면 HERO_CONTENT.imageSrc 값을 수정하세요.
         *   예) imageSrc: "/service-preview.png"
         */}
        <div className="relative mx-auto mt-4 w-full max-w-4xl">
          {HERO_CONTENT.imageSrc ? (
            /* 실제 이미지가 있는 경우 */
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl shadow-2xl shadow-primary/10 ring-1 ring-border">
              <Image
                src={HERO_CONTENT.imageSrc}
                alt={HERO_CONTENT.imageAlt}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 896px"
              />
            </div>
          ) : (
            /* 이미지가 없는 경우: 플레이스홀더 */
            <div
              className="relative flex aspect-video w-full flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border-2 border-dashed border-primary/20 bg-gradient-to-br from-secondary/50 to-background shadow-xl shadow-primary/5"
              role="img"
              aria-label="서비스 예시 이미지 영역 (준비 중)"
            >
              {/* 플레이스홀더 배경 장식 */}
              <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

              {/* 아이콘 */}
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-white shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary/50" aria-hidden="true">
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="m9 9 5 12 1.774-5.226L21 14 9 9z" />
                </svg>
              </div>

              {/* 플레이스홀더 안내 텍스트 */}
              {/* [홍보팀] 이 아래 텍스트는 이미지가 없을 때만 표시됩니다. 이미지를 추가하면 자동으로 사라집니다. */}
              <div className="relative text-center">
                <p className="text-sm font-semibold text-primary/60">서비스 화면 이미지</p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  public/ 폴더에 이미지를 넣고 HERO_CONTENT.imageSrc 값을 수정하세요
                </p>
              </div>

              {/* 장식용 UI 요소 (서비스 화면 느낌) */}
              <div aria-hidden="true" className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-30">
                <div className="h-2 flex-1 rounded-full bg-primary/40" />
                <div className="h-2 w-1/3 rounded-full bg-primary/20" />
                <div className="h-2 w-1/4 rounded-full bg-primary/30" />
              </div>
            </div>
          )}

          {/* 이미지 하단 그라데이션 페이드 효과 */}
          <div aria-hidden="true" className="absolute -bottom-px left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
        </div>

        {/* ─── 신뢰 지표 ──────────────────────────────────────── */}
        {/*
         * [홍보팀] 숫자와 설명 텍스트를 실제 데이터로 수정하세요.
         * HERO_CONTENT.stats 배열의 value와 label을 바꾸면 됩니다.
         */}
        <div className="flex flex-col items-center gap-6 pt-2 sm:flex-row sm:justify-center sm:gap-12">
          {HERO_CONTENT.stats.map((stat, i) => (
            <div key={stat.label} className="flex items-center gap-6 sm:contents">
              {i > 0 && (
                <div className="hidden h-8 w-px bg-slate-200 sm:block" aria-hidden="true" />
              )}
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 스크롤 유도 화살표 */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-muted-foreground/40"
        aria-hidden="true"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </section>
  );
}
