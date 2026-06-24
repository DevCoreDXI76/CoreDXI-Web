import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { ArrowRight, Target, Users, Zap, Shield } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = pageMetadata({
  title: "회사 소개",
  description:
    "CoreDXI는 기업의 비즈니스 핵심을 AI로 깨우는 AX 전환 전문 파트너입니다. 복잡한 협업을 심플하게, 변화는 단단하게 설계합니다.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-16">
        {/* ── 히어로 ─────────────────────────────────────────── */}
        <section className="bg-gradient-to-b from-background to-secondary/20 px-6 pb-20 pt-24 text-center">
          <div className="mx-auto max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.06] px-4 py-1.5 text-sm font-medium text-primary">
              회사 소개
            </div>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl">
              비즈니스의 중심(Core)을
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                AI로 깨우다.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              CoreDXI는 복잡한 기업 협업을 AI로 단순화하고, 지속 가능한
              디지털 전환을 설계하는 AX 코어 파트너입니다.
            </p>
          </div>
        </section>

        {/* ── 미션 ─────────────────────────────────────────────── */}
        <section className="bg-white px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-12 md:grid-cols-2 md:items-center">
              <div>
                <p className="text-sm font-semibold text-primary">우리의 미션</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground">
                  기술이 아닌 비즈니스
                  <br />
                  문제를 해결합니다
                </h2>
                <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                  AI는 도구입니다. CoreDXI는 그 도구를 고객의 비즈니스에
                  맞게 설계하고, 조직이 실제로 활용할 수 있는 형태로
                  전달합니다. 기술 도입에 그치지 않고, 측정 가능한 성과로
                  연결합니다.
                </p>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                  CoreDXI(코어디엑스아이)의 &#39;Core&#39;는 비즈니스의 핵심을
                  의미합니다. 조직의 본질적인 문제를 파악하고, AI를 통해
                  그 핵심을 강화하는 것이 우리의 목표입니다.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    Icon: Target,
                    title: "목표 중심",
                    desc: "KPI 기반 AI 도입 전략 수립",
                  },
                  {
                    Icon: Zap,
                    title: "빠른 성과",
                    desc: "4~8주 PoC로 가치 검증",
                  },
                  {
                    Icon: Users,
                    title: "협업 최적화",
                    desc: "팀 생산성 최대 3배 향상",
                  },
                  {
                    Icon: Shield,
                    title: "엔터프라이즈 보안",
                    desc: "컴플라이언스 준수 설계",
                  },
                ].map(({ Icon, title, desc }) => (
                  <div
                    key={title}
                    className="rounded-xl border border-border bg-secondary/30 p-5"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                    <p className="mt-3 font-semibold text-foreground">{title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 핵심 가치 ─────────────────────────────────────────── */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <p className="text-sm font-semibold text-primary">핵심 가치</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground">
                CoreDXI가 일하는 방식
              </h2>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {[
                {
                  num: "01",
                  title: "단순함",
                  desc: "복잡한 AI 기술을 누구나 쓸 수 있는 솔루션으로. 복잡성은 우리가 책임지고, 고객에게는 단순한 경험을 전달합니다.",
                },
                {
                  num: "02",
                  title: "견고함",
                  desc: "트렌드가 아닌 지속 가능성을 설계합니다. 도입 후 운영까지 책임지는 파트너십이 CoreDXI의 약속입니다.",
                },
                {
                  num: "03",
                  title: "투명함",
                  desc: "ROI, 진행 상황, 리스크를 숨기지 않습니다. 데이터 기반의 솔직한 커뮤니케이션으로 신뢰를 만들어 갑니다.",
                },
              ].map((v) => (
                <div
                  key={v.num}
                  className="rounded-2xl border border-border bg-white p-8 shadow-sm"
                >
                  <span className="text-4xl font-black text-primary/20">
                    {v.num}
                  </span>
                  <h3 className="mt-4 text-xl font-bold text-foreground">
                    {v.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {v.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 수치 ─────────────────────────────────────────────── */}
        <section className="bg-primary px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <div className="grid grid-cols-3 gap-8 text-center text-white">
              {[
                { value: "50+", label: "도입 기업" },
                { value: "98%", label: "고객 만족도" },
                { value: "3배", label: "평균 업무 효율 향상" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-4xl font-extrabold">{s.value}</p>
                  <p className="mt-2 text-sm text-white/70">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────── */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              CoreDXI와 함께 시작하세요
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              AI 전환의 첫 걸음, 부담 없이 상담해 보세요. 영업일 기준 1~2일
              내에 담당자가 연락드립니다.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
              >
                도입 문의하기
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/solutions"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-primary/30 bg-white px-8 py-4 text-sm font-semibold text-primary transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/5"
              >
                솔루션 보기
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
