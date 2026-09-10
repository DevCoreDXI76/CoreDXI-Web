/**
 * AxCheckPriorityCards.tsx — AX 체크 우선 과제 카드 UI
 *
 * 제출 직후 결과 화면(AxCheckForm)과 메일 링크 재열람 페이지(/ax-check/result/[token])가
 * 동일한 카드 UI를 공유한다. [홍보팀] 카드 문구 자체는 src/lib/ax-check/catalog.ts에서 관리합니다.
 */

import { ArrowRight, FileText, Lightbulb } from "lucide-react";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { SAFETY_DOCS_BRANCH_COPY, SAFETY_DOCS_DEMO_SOURCE } from "@/lib/ax-check/catalog";
import { trackEvent } from "@/lib/ga4-events";
import type { AxCheckPriority } from "@/lib/ax-check/summarize";

type Props = {
  company?: string;
  priorities: AxCheckPriority[];
  /** Q9(안전서류 작성 시간) 월 4시간 이상 응답 — true면 아래 안전서류 분기 블록을 보여준다. */
  safetyDocsBranch?: boolean;
  /** 안전서류 도입 사례 PDF URL. null/undefined면 "도입 사례 보기(PDF)" 버튼을 숨긴다. */
  caseStudyUrl?: string | null;
};

export function AxCheckPriorityCards({
  company,
  priorities,
  safetyDocsBranch,
  caseStudyUrl,
}: Props) {
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="text-center">
        <span className="inline-flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Lightbulb className="size-6" aria-hidden="true" />
        </span>
        {/* 실제 선택 개수(1~3)에 맞춘다 — T0 메일 문구("우선 과제 N가지")와 어긋나면 안 된다. */}
        <h2 className="mt-4 text-lg font-bold text-foreground">
          {`${company ? `${company}의 ` : ""}AX 우선 과제 ${priorities.length}가지`}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          정리된 상세 진단서를 영업일 기준 2~3일 내 메일로 보내드립니다. 우선 과제가 뚜렷한
          경우 담당 이사가 직접 연락드립니다.
        </p>
      </div>

      <ol className="mt-6 space-y-3">
        {priorities.map((priority, index) => (
          <li
            key={`${priority.title}-${index}`}
            className="rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {index + 1}
              </span>
              {priority.title}
            </p>
            <p className="mt-2 text-xs font-medium text-primary">{priority.echo}</p>
            {priority.industryExample ? (
              <p className="mt-1 text-xs text-muted-foreground">{priority.industryExample}</p>
            ) : null}
            <p className="mt-2 text-sm text-muted-foreground">{priority.why}</p>
            <dl className="mt-3 space-y-1.5 text-xs text-muted-foreground">
              <div className="flex gap-1.5">
                <dt className="shrink-0 font-medium text-foreground">첫 1주</dt>
                <dd>{priority.roadmap[0]}</dd>
              </div>
              <div className="flex gap-1.5">
                <dt className="shrink-0 font-medium text-foreground">첫 1개월</dt>
                <dd>{priority.roadmap[1]}</dd>
              </div>
              <div className="flex gap-1.5">
                <dt className="shrink-0 font-medium text-foreground">3개월</dt>
                <dd>{priority.roadmap[2]}</dd>
              </div>
              <div className="flex gap-1.5">
                <dt className="shrink-0 font-medium text-foreground">기대 효과</dt>
                <dd>{priority.expectedEffect}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ol>

      {safetyDocsBranch ? (
        <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm font-bold text-foreground">
            {SAFETY_DOCS_BRANCH_COPY.resultHeadline}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {SAFETY_DOCS_BRANCH_COPY.resultBody}
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            {caseStudyUrl ? (
              <a
                href={caseStudyUrl}
                target="_blank"
                rel="noopener"
                onClick={() =>
                  trackEvent("cta_click", { cta_location: "ax_check_result_safety_case_study" })
                }
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted/50"
              >
                <FileText className="size-4" aria-hidden="true" />
                {SAFETY_DOCS_BRANCH_COPY.caseStudyCtaLabel}
              </a>
            ) : null}
            <TrackedCtaLink
              href={`/contact?source=${SAFETY_DOCS_DEMO_SOURCE}`}
              location="ax_check_result_safety_demo"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {SAFETY_DOCS_BRANCH_COPY.demoCtaLabel}
            </TrackedCtaLink>
          </div>
        </div>
      ) : null}

      <div className="mt-8 flex flex-col gap-2.5">
        <TrackedCtaLink
          href="/contact"
          location="ax_check_result"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          담당자와 상담하기
          <ArrowRight className="size-4" aria-hidden="true" />
        </TrackedCtaLink>
      </div>
    </div>
  );
}
