import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BrainCircuit, BarChart3, Network, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "솔루션 — CoreDXI",
  description:
    "CoreDXI의 AI 기반 AX 전환 솔루션을 소개합니다. AI 협업 자동화, AX 전환 컨설팅, 엔터프라이즈 AI 플랫폼으로 비즈니스 핵심을 강화하세요.",
};

const SOLUTIONS = [
  {
    Icon: BrainCircuit,
    badge: "AI 협업",
    title: "AI 협업 자동화",
    desc: "반복적인 회의, 보고, 업무 배분을 AI가 자동화합니다. 복잡한 협업 워크플로우를 단순화하여 팀의 핵심 업무에 집중할 수 있도록 지원합니다.",
    features: [
      "회의록 자동 생성 및 액션 아이템 추출",
      "업무 우선순위 AI 추천",
      "슬랙·Teams·이메일 통합 허브",
      "실시간 진행 현황 대시보드",
    ],
  },
  {
    Icon: BarChart3,
    badge: "AX 컨설팅",
    title: "AX 전환 컨설팅",
    desc: "조직의 현황을 진단하고 AI 전환 로드맵을 수립합니다. PoC부터 전사 확산까지, 단계별로 리스크를 관리하며 성과를 만들어 냅니다.",
    features: [
      "AI 성숙도 진단 및 갭 분석",
      "4~8주 PoC 설계 및 운영",
      "ROI 기반 투자 우선순위 결정",
      "변화 관리 및 조직 내재화 지원",
    ],
  },
  {
    Icon: Network,
    badge: "엔터프라이즈",
    title: "엔터프라이즈 AI 플랫폼",
    desc: "기업 맞춤형 AI 인프라를 설계하고 구축합니다. 보안·컴플라이언스 요건을 충족하면서도, 높은 확장성과 안정성을 제공하는 플랫폼을 제공합니다.",
    features: [
      "온프레미스 및 프라이빗 클라우드 지원",
      "데이터 보안 및 접근 권한 관리",
      "기존 ERP·CRM 시스템 연동",
      "24/7 모니터링 및 SLA 보장",
    ],
  },
];

const PROCESS_STEPS = [
  { step: "01", title: "현황 진단", desc: "조직의 AI 성숙도와 핵심 문제를 파악합니다." },
  { step: "02", title: "로드맵 수립", desc: "ROI 기반의 실행 가능한 전환 계획을 수립합니다." },
  { step: "03", title: "PoC 검증", desc: "4~8주 내 실제 환경에서 가치를 검증합니다." },
  { step: "04", title: "전사 확산", desc: "검증된 솔루션을 전 조직으로 확장합니다." },
];

export default function SolutionsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-16">
        {/* ── 히어로 ─────────────────────────────────────────── */}
        <section className="bg-gradient-to-b from-background to-secondary/20 px-6 pb-20 pt-24 text-center">
          <div className="mx-auto max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.06] px-4 py-1.5 text-sm font-medium text-primary">
              AI 기반 AX 전환 솔루션
            </div>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl">
              복잡한 협업은 심플하게,
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                변화는 단단하게.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              CoreDXI의 AX 솔루션은 기업의 실제 문제에서 출발합니다. AI 기술을
              조직에 맞게 설계하고, 측정 가능한 성과로 연결합니다.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90"
              >
                무료 도입 상담
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/cases"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-primary/30 bg-white px-8 py-4 text-sm font-semibold text-primary transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/5"
              >
                성공사례 보기
              </Link>
            </div>
          </div>
        </section>

        {/* ── 솔루션 카드 ──────────────────────────────────────── */}
        <section className="bg-white px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <p className="text-sm font-semibold text-primary">3가지 핵심 솔루션</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground">
                비즈니스 목표에 맞는 솔루션을 선택하세요
              </h2>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {SOLUTIONS.map(({ Icon, badge, title, desc, features }) => (
                <div
                  key={title}
                  className="flex flex-col rounded-2xl border border-border bg-background p-8 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
                      {badge}
                    </span>
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-foreground">
                    {title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {desc}
                  </p>
                  <ul className="mt-6 flex-1 space-y-2">
                    {features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/contact"
                    className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-primary/90"
                  >
                    도입 문의
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 도입 프로세스 ─────────────────────────────────────── */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <div className="mb-12 text-center">
              <p className="text-sm font-semibold text-primary">도입 프로세스</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground">
                4단계로 완성되는 AI 전환
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
                처음부터 전사 배포까지, CoreDXI가 각 단계를 함께 설계하고
                실행합니다.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {PROCESS_STEPS.map(({ step, title, desc }) => (
                <div
                  key={step}
                  className="relative rounded-2xl border border-border bg-white p-6 shadow-sm"
                >
                  <span className="text-5xl font-black text-primary/15">
                    {step}
                  </span>
                  <h3 className="mt-2 text-lg font-bold text-foreground">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────── */}
        <section className="bg-primary px-6 py-20">
          <div className="mx-auto max-w-3xl text-center text-white">
            <h2 className="text-3xl font-bold tracking-tight">
              지금 바로 무료 상담을 신청하세요
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/70">
              영업일 기준 1~2일 내 전문 컨설턴트가 연락드립니다. AI 전환의
              첫 걸음, CoreDXI와 함께 시작하세요.
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-semibold text-primary shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              무료 도입 상담 신청
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
