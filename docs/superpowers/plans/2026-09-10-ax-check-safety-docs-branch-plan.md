# AX 체크 안전서류 분기(Q9) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/ax-check` 설문에 Q9(안전서류 작성 시간) 문항을 추가하고, 월 4시간 이상 응답 시 결과 화면·T1(상세 진단) 메일에 Safety-RAG 사례·10분 데모 CTA 블록을 붙여, 11/30 전 Safety-RAG 파일럿 후보 1곳을 찾을 수 있게 한다.

**Architecture:** 기존 AX 체크 파이프라인(`catalog.ts` 데이터 → `summarize.ts` 순수 요약 → `actions/ax-check.ts` 저장·발송 → `email-draft.ts`/`followup.ts` 메일)에 Q9 문항 1개와 파생 불리언 `safetyDocsBranch` 1개를 얹는다. 새 DB 컬럼·새 테이블·새 이벤트 분석 SDK 없음 — `answers`/`summary` 기존 Json 컬럼에 얹혀 간다. "10분 데모 신청"은 새 폼을 만들지 않고 기존 `/contact` 폼을 `?source=safety_docs` 쿼리로 재사용한다.

**Tech Stack:** Next.js 15 App Router, TypeScript, Prisma(PostgreSQL/Supabase) — 이번 작업은 스키마 변경 없음, Vitest, Playwright.

**Spec:** `docs/20260910_전달_사내_SafetyRAG오너_AX체크안전서류분기전달물_v1.md` (Safety-RAG 오너 원본 — 문구 축·금지 표현·임계값은 이 문서 기준, 구현·디자인 판단은 본 계획 재량)

## 사전 확인 — 로드맵 정합성

CLAUDE.md 프로젝트 지침의 "신규 기능 착수 게이트"(실응답 5건+HOT 1건 전까지 E 2차 T2 너처·Calendly·LLM·Broadcasts·3단계 코드 착수 금지)는 이 작업을 막지 않는다 — Q9+분기는 이미 배포된 1~2단계 결과/메일 파이프라인 위에 문항 1개·조건부 블록 1개를 얹는 것이지, 게이트가 명시한 항목(너처·Calendly·LLM·Broadcasts·3단계 팔로업 뉴스레터)이 아니다. 또한 9/9에 전달 시도됐으나 실행 큐에 들어가지 않은 것으로 확인된, 이미 승인된 작업이다. 다만 이 작업은 "안전서류 4시간 이상" 리드를 골라 별도 파일럿(Safety-RAG)으로 보내는 **병행 트랙**이므로, 완료 후 Phase 1.5 게이트 카운트(실응답 5건+HOT 1건)와는 별개로 추적해야 한다.

## Global Constraints

- 임계값(Q9 3·4·5번 = 월 4시간 이상 → 분기 ON)은 상수로 분리해 재조정 가능하게 유지한다(스펙 2번).
- 금지 표현 "AI로 위험성평가표를 만들어 드립니다"는 어떤 카피에도 넣지 않는다(정부 KRAS 무료 제공, 스펙 3번).
- 새 블록의 화자는 항상 "코어디엑스아이", 개인 직함을 쓰지 않는다(스펙 3번) — 기존 이메일 하단 서명(`SALES_SIGNATURE`)은 그대로 둔다(별개 기존 관례).
- 집계는 "Q9 분포·분기 ON 건수·데모 신청 건수" 3개 숫자만 조회 가능하면 된다 — 이벤트 분석 SDK·새 대시보드를 만들지 않는다(스펙 5번).
- `prisma migrate dev` 금지. 이번 작업은 Prisma 스키마 변경이 아예 없다(기존 `answers`/`summary` Json 컬럼 재사용) — 마이그레이션 파일 자체가 필요 없다.
- 새 UI는 기존 브랜드 컬러(`primary` 토큰)·`rounded-xl` 코너·기존 버튼 패턴만 쓴다. 임의 색상 추가 금지.
- 컴포넌트 파일에는 `[홍보팀]` 태그 한국어 주석, `any` 타입 금지, Named Export 유지.
- 사례 PDF(`20260909_제안서_사내_SafetyRAG도입사례_v1`)는 아직 저장소에 없다 — 코드는 이 파일 부재를 전제로, 환경변수가 비어 있으면 해당 CTA만 조용히 숨기도록 짠다(기존 `brochureUrl` 관례와 동일).

---

## Task 1: catalog.ts — Q9 문항·분기 상수·카피

**Files:**
- Modify: `src/lib/ax-check/catalog.ts`
- Test: `src/lib/ax-check/catalog.test.ts` (신규)

**Interfaces:**
- Produces: `Q9_SAFETY_DOCS_TIME: readonly AxCheckOption[]`, `SAFETY_DOCS_BRANCH_ON_VALUES: Set<string>`, `SAFETY_DOCS_BRANCH_COPY: { resultHeadline, resultBody, caseStudyCtaLabel, demoCtaLabel, emailExtraLine }`, `SAFETY_DOCS_DEMO_SOURCE: "safety_docs"`, `SAFETY_DOCS_DEMO_INQUIRY_TYPE: string`, `getSafetyDocsCaseStudyUrl(): string | null`. 이후 모든 태스크가 이 이름을 그대로 가져다 쓴다.

- [ ] **Step 1: 실패하는 테스트 작성**

`src/lib/ax-check/catalog.test.ts` 새로 생성:

```ts
import { describe, expect, it } from "vitest";
import {
  AX_CHECK_QUESTIONS,
  CATALOG_VERSION,
  SAFETY_DOCS_BRANCH_COPY,
  SAFETY_DOCS_BRANCH_ON_VALUES,
  SAFETY_DOCS_DEMO_INQUIRY_TYPE,
  SAFETY_DOCS_DEMO_SOURCE,
  getSafetyDocsCaseStudyUrl,
} from "./catalog";

const FORBIDDEN_PHRASE = "AI로 위험성평가표를 만들어";

describe("Q9 — 안전서류 작성 시간 문항", () => {
  it("AX_CHECK_QUESTIONS 9번째(q9)로 등록되어 있다", () => {
    expect(AX_CHECK_QUESTIONS).toHaveLength(9);
    expect(AX_CHECK_QUESTIONS[8]?.id).toBe("q9");
    expect(AX_CHECK_QUESTIONS[8]?.options).toHaveLength(6);
  });

  it("CATALOG_VERSION이 v3로 올라간다", () => {
    expect(CATALOG_VERSION).toBe("v3");
  });

  it("분기 ON 값은 월 4시간 이상 3개 구간뿐이다", () => {
    expect([...SAFETY_DOCS_BRANCH_ON_VALUES].sort()).toEqual(
      ["4_8h", "8_16h", "over_16h"].sort()
    );
    expect(SAFETY_DOCS_BRANCH_ON_VALUES.has("none")).toBe(false);
    expect(SAFETY_DOCS_BRANCH_ON_VALUES.has("under_4h")).toBe(false);
    expect(SAFETY_DOCS_BRANCH_ON_VALUES.has("unknown")).toBe(false);
  });
});

describe("SAFETY_DOCS_BRANCH_COPY — 금지 표현 회귀 테스트", () => {
  it("정부 KRAS 무료 제공 문구와 겹치는 금지 표현을 포함하지 않는다", () => {
    const allText = Object.values(SAFETY_DOCS_BRANCH_COPY).join("\n");
    expect(allText).not.toContain(FORBIDDEN_PHRASE);
  });
});

describe("getSafetyDocsCaseStudyUrl", () => {
  it("환경변수가 없으면 null을 반환한다(CTA 숨김)", () => {
    delete process.env.AX_CHECK_SAFETY_CASE_STUDY_URL;
    expect(getSafetyDocsCaseStudyUrl()).toBeNull();
  });

  it("환경변수가 있으면 그 값을 그대로 반환한다", () => {
    process.env.AX_CHECK_SAFETY_CASE_STUDY_URL = "https://www.coredxi.com/docs/safety-rag-case-study.pdf";
    expect(getSafetyDocsCaseStudyUrl()).toBe(
      "https://www.coredxi.com/docs/safety-rag-case-study.pdf"
    );
    delete process.env.AX_CHECK_SAFETY_CASE_STUDY_URL;
  });
});

describe("SAFETY_DOCS_DEMO_SOURCE / SAFETY_DOCS_DEMO_INQUIRY_TYPE", () => {
  it("값이 비어있지 않다(ContactPageClient·AxCheckPriorityCards가 그대로 참조)", () => {
    expect(SAFETY_DOCS_DEMO_SOURCE).toBe("safety_docs");
    expect(SAFETY_DOCS_DEMO_INQUIRY_TYPE.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: 테스트 실행 → 실패 확인**

Run: `npm run test -- catalog.test.ts`
Expected: FAIL — `Q9_SAFETY_DOCS_TIME`/`SAFETY_DOCS_BRANCH_ON_VALUES` 등을 찾을 수 없다는 모듈 오류, `AX_CHECK_QUESTIONS`가 아직 길이 8.

- [ ] **Step 3: catalog.ts 구현**

`CATALOG_VERSION` 값 변경(15번째 줄):

```ts
export const CATALOG_VERSION = "v3";
```

`AxCheckSingleQuestion`의 id 유니언에 `"q9"` 추가(20번째 줄):

```ts
export type AxCheckSingleQuestion = {
  id: "q1" | "q2" | "q4" | "q5" | "q6" | "q7" | "q8" | "q9";
  type: "single";
  prompt: string;
  options: readonly AxCheckOption[];
  allowOther?: boolean;
};
```

`Q8_AUTHORITY` 정의(107~112번째 줄) 바로 다음에 Q9 데이터 추가:

```ts
// Q9 — 현장 안전서류 작성 소요 시간 (Safety-RAG 오너 분기 전달물 2026-09-10 반영)
// 참고: docs/20260910_전달_사내_SafetyRAG오너_AX체크안전서류분기전달물_v1.md 1번
export const Q9_SAFETY_DOCS_TIME: readonly AxCheckOption[] = [
  { value: "none", label: "거의 없음" },
  { value: "under_4h", label: "월 4시간 미만" },
  { value: "4_8h", label: "월 4~8시간" },
  { value: "8_16h", label: "월 8~16시간" },
  { value: "over_16h", label: "월 16시간 이상" },
  { value: "unknown", label: "잘 모르겠음 / 담당자마다 다름" },
] as const;

/**
 * Q9이 이 값 중 하나면(월 4시간 이상) 안전서류 분기 ON — summarize.ts가 계산해
 * AxCheckSummary.safetyDocsBranch로 저장한다. 임계값은 오너 결정(2026-09-10, 현장 감각
 * 기준 4시간) — 응답이 쌓이면 재조정 가능하므로 상수로 분리해 둔다.
 */
export const SAFETY_DOCS_BRANCH_ON_VALUES = new Set(["4_8h", "8_16h", "over_16h"]);
```

`AX_CHECK_QUESTIONS` 배열(114~130번째 줄) 마지막(q8) 다음에 q9 항목 추가:

```ts
export const AX_CHECK_QUESTIONS: readonly AxCheckQuestion[] = [
  { id: "q1", type: "single", prompt: "귀사의 주력 사업은 무엇인가요?", options: Q1_INDUSTRY, allowOther: true },
  { id: "q2", type: "single", prompt: "임직원 규모는?", options: Q2_COMPANY_SIZE },
  {
    id: "q3",
    type: "multi",
    prompt: "가장 시간이 많이 드는 반복 업무는? (최대 3개)",
    options: Q3_REPETITIVE_TASKS,
    maxSelect: Q3_MAX_SELECT,
    allowOther: true,
  },
  { id: "q4", type: "single", prompt: "현재 AI 도구 활용 수준은?", options: Q4_AI_MATURITY },
  { id: "q5", type: "single", prompt: "업무 데이터는 주로 어디에 있나요?", options: Q5_DATA_LOCATION },
  { id: "q6", type: "single", prompt: "AI 도입으로 가장 기대하는 효과는?", options: Q6_EXPECTED_BENEFIT },
  { id: "q7", type: "single", prompt: "도입 검토 시점은?", options: Q7_TIMING },
  { id: "q8", type: "single", prompt: "도입 결정은 어떻게 이뤄지나요?", options: Q8_AUTHORITY },
  {
    id: "q9",
    type: "single",
    prompt: "귀사는 현장 안전서류(위험성평가표·표준작업계획서·TBM일지 등) 작성에 월 평균 몇 시간을 쓰고 계신가요?",
    options: Q9_SAFETY_DOCS_TIME,
  },
] as const;
```

파일 맨 끝(`INTRO_COPY` 다음)에 분기 카피·CTA 상수·URL 헬퍼 추가:

```ts
/**
 * 안전서류 분기(Q9 3·4·5번 선택) 결과 화면·T1 메일에 붙는 공통 카피.
 * [홍보팀] 문구만 바꾸려면 이 객체 안의 문자열만 수정하면 됩니다.
 *
 * 금지 표현: "AI로 위험성평가표를 만들어 드립니다" — 정부 KRAS가 무료로 제공하는 서비스라
 * 이 표현을 쓰면 안 됩니다. "서류 세트를 귀사 공종·서식에 맞게 + 직접 구축·운영 경험"
 * 축으로만 다듬어 주세요. 화자는 항상 "코어디엑스아이"이고 개인 직함을 쓰지 않습니다.
 * 참고: docs/20260910_전달_사내_SafetyRAG오너_AX체크안전서류분기전달물_v1.md 3번
 */
export const SAFETY_DOCS_BRANCH_COPY = {
  resultHeadline: "현장 안전서류, 매번 새로 만들고 계시죠.",
  resultBody:
    "코어디엑스아이는 위험성평가표·표준작업계획서·TBM일지 3종을 현장·공종에 맞춰 순서대로 초안 생성하는 시스템을 직접 만들어 운영하고 있습니다. 슬라이드가 아니라 지금 돌아가는 실물입니다.",
  caseStudyCtaLabel: "도입 사례 보기(PDF)",
  demoCtaLabel: "10분 데모 신청",
  emailExtraLine:
    '귀사 서식·공종에 맞춰 구축하는 "안전서류 AI 도입 패키지"(4~6주)도 준비되어 있습니다. 데모 후 안내드립니다.',
} as const;

/** "10분 데모 신청" CTA가 /contact로 넘기는 쿼리 값 — ContactPageClient가 이 값으로 유입 경로를 식별한다. */
export const SAFETY_DOCS_DEMO_SOURCE = "safety_docs";

/** source=safety_docs로 들어온 문의의 고정 문의 유형 라벨 — 관리자 문의 목록에서 이 값으로 필터링해 데모 신청 건수를 센다. */
export const SAFETY_DOCS_DEMO_INQUIRY_TYPE = "안전서류 AI 도입 데모 신청";

/**
 * 안전서류 도입 사례 PDF URL — 미설정이면 null(결과 화면·T1 메일에서 "도입 사례 보기(PDF)"
 * 버튼이 통째로 빠진다, AX_CHECK_BROCHURE_URL과 동일한 관례). Safety-RAG 오너로부터 최종
 * PDF(`_draft` 제거본)를 받으면 public/docs/에 올리고 이 환경변수를 등록한다.
 */
export function getSafetyDocsCaseStudyUrl(): string | null {
  const url = process.env.AX_CHECK_SAFETY_CASE_STUDY_URL?.trim();
  return url || null;
}
```

- [ ] **Step 4: 테스트 실행 → 통과 확인**

Run: `npm run test -- catalog.test.ts`
Expected: PASS (7개 테스트)

- [ ] **Step 5: 기존 CATALOG_VERSION 리터럴 점검**

Run: `grep -rn "\"v2\"" src/lib/ax-check src/actions/ax-check.test.ts src/lib/ax-check/*.test.ts`

과거 응답 레코드를 흉내 내는 목(mock) 데이터(`catalogVersion: "v2"` 등)는 "그 시점에 저장된 값"이라 그대로 둔다. `CATALOG_VERSION` 상수를 동적으로 참조하며 `"v2"`를 기대하는 assertion이 있다면 `"v3"`로 고친다(있다면 이 시점에 함께 수정, 없으면 스킵).

- [ ] **Step 6: 커밋**

```bash
git add src/lib/ax-check/catalog.ts src/lib/ax-check/catalog.test.ts
git commit -m "feat(ax-check): Q9 안전서류 작성시간 문항·분기 상수·카피 추가

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 2: summarize.ts — Q9 답변 타입 + safetyDocsBranch 계산

**Files:**
- Modify: `src/lib/ax-check/summarize.ts`
- Test: `src/lib/ax-check/summarize.test.ts`

**Interfaces:**
- Consumes: `SAFETY_DOCS_BRANCH_ON_VALUES` (Task 1)
- Produces: `AxCheckAnswers.q9: string`, `AxCheckSummary.safetyDocsBranch: boolean`, `summarizeAxCheck()`가 이 필드를 채워 반환. Task 3(email-draft)·Task 4(actions)가 그대로 소비한다.

- [ ] **Step 1: 실패하는 테스트 작성**

`src/lib/ax-check/summarize.test.ts`의 `baseAnswers()` 헬퍼(5~17번째 줄)에 `q9` 기본값 추가(분기 OFF 값으로 — 기존 테스트들이 분기와 무관하게 계속 통과해야 한다):

```ts
function baseAnswers(overrides: Partial<AxCheckAnswers> = {}): AxCheckAnswers {
  return {
    q1: "network",
    q2: "10_to_30",
    q3: ["quote", "bidding"],
    q4: "personal",
    q5: "files",
    q6: "speed",
    q7: "within_3_months",
    q8: "self_decide",
    q9: "under_4h",
    ...overrides,
  };
}
```

파일 끝에 새 describe 블록 추가:

```ts
describe("summarizeAxCheck — Q9 안전서류 분기", () => {
  it.each(["4_8h", "8_16h", "over_16h"])("Q9=%s면 safetyDocsBranch: true", (q9) => {
    const summary = summarizeAxCheck(baseAnswers({ q9 }));
    expect(summary.safetyDocsBranch).toBe(true);
  });

  it.each(["none", "under_4h", "unknown"])("Q9=%s면 safetyDocsBranch: false", (q9) => {
    const summary = summarizeAxCheck(baseAnswers({ q9 }));
    expect(summary.safetyDocsBranch).toBe(false);
  });
});
```

- [ ] **Step 2: 테스트 실행 → 실패 확인**

Run: `npm run test -- summarize.test.ts`
Expected: FAIL — TypeScript 컴파일 오류(`AxCheckAnswers`에 `q9`가 없음) 또는 `summary.safetyDocsBranch`가 `undefined`.

- [ ] **Step 3: summarize.ts 구현**

Import 목록(11~33번째 줄)에 `SAFETY_DOCS_BRANCH_ON_VALUES` 추가:

```ts
import {
  AUTHORITY_DECISIVE,
  CATALOG_VERSION,
  DATA_PREP_STEP_LABEL,
  EFFECT_DISCLAIMER,
  EXPECTED_EFFECT_TONE_SUFFIX,
  GRADE_BASE_SCORE,
  getOptionLabel,
  getQuestionById,
  INDUSTRY_TASK_EXAMPLES,
  NO_AI_EXPERIENCE,
  NO_AI_EXPERIENCE_STEP_LABEL,
  objectParticle,
  Q3_MAX_SELECT,
  Q5_NEEDS_DATA_PREP,
  SAFETY_DOCS_BRANCH_ON_VALUES,
  SMALL_TEAM_SIZE,
  SMALL_TEAM_STEP_LABEL,
  TASK_CARDS,
  TIMING_CONSIDERING,
  TIMING_NEAR_TERM,
  type AxCheckTaskCard,
  type CatalogLeadGrade,
} from "./catalog";
```

`AxCheckAnswers` 타입(35~46번째 줄)에 `q9` 추가:

```ts
export type AxCheckAnswers = {
  q1: string;
  q2: string;
  /** 최대 3개 선택 (Q3_MAX_SELECT) */
  q3: string[];
  q3Other?: string;
  q4: string;
  q5: string;
  q6: string;
  q7: string;
  q8: string;
  q9: string;
};
```

`AxCheckSummary` 타입(60~65번째 줄)에 `safetyDocsBranch` 추가:

```ts
export type AxCheckSummary = {
  priorities: AxCheckPriority[];
  grade: CatalogLeadGrade;
  score: number;
  catalogVersion: string;
  /** Q9(안전서류 작성 시간) 월 4시간 이상 응답 — 결과 화면·T1 메일 분기 블록 노출 여부. */
  safetyDocsBranch: boolean;
};
```

`summarizeAxCheck()`(134~142번째 줄) 수정:

```ts
export function summarizeAxCheck(answers: AxCheckAnswers): AxCheckSummary {
  const selectedTasks = answers.q3.slice(0, Q3_MAX_SELECT);
  const priorities = selectedTasks.map((taskValue) => buildPriority(taskValue, answers));

  const grade = gradeAxCheck(answers);
  const score = computeScore(grade, selectedTasks.length);
  const safetyDocsBranch = SAFETY_DOCS_BRANCH_ON_VALUES.has(answers.q9);

  return { priorities, grade, score, catalogVersion: CATALOG_VERSION, safetyDocsBranch };
}
```

- [ ] **Step 4: 테스트 실행 → 통과 확인**

Run: `npm run test -- summarize.test.ts`
Expected: PASS(기존 테스트 전부 + 신규 6개)

- [ ] **Step 5: 커밋**

```bash
git add src/lib/ax-check/summarize.ts src/lib/ax-check/summarize.test.ts
git commit -m "feat(ax-check): summarizeAxCheck이 Q9 기반 safetyDocsBranch를 계산

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 3: email-draft.ts — T1 상세본에 분기 블록 삽입

**Files:**
- Modify: `src/lib/ax-check/email-draft.ts`
- Test: `src/lib/ax-check/email-draft.test.ts`

**Interfaces:**
- Consumes: `AxCheckSummary.safetyDocsBranch`(Task 2), `SAFETY_DOCS_BRANCH_COPY`·`getSafetyDocsCaseStudyUrl()`(Task 1)
- Produces: `buildCustomerEmailDraft(answers, summary, contact, opts)`의 `links?: { caseStudyUrl?: string | null }` 5번째 인자. Task 4(`actions/ax-check.ts`는 이 함수를 직접 쓰지 않음)·Task 5(`followup.ts`)가 이 시그니처로 호출한다.

스펙 3번 "메일(상세본 끝에 같은 블록 + 한 줄 추가)"은 T1(상세 진단, `buildCustomerEmailDraft`)만 가리킨다. T0(`buildT0Email`, 제출 즉시 요약)는 스펙 범위 밖이라 손대지 않는다.

- [ ] **Step 1: 실패하는 테스트 작성**

`email-draft.test.ts`의 `baseAnswers()` 헬퍼(6~18번째 줄)에 `q9: "under_4h"` 추가(기존 테스트는 분기 OFF로 유지):

```ts
function baseAnswers(overrides: Partial<AxCheckAnswers> = {}): AxCheckAnswers {
  return {
    q1: "network",
    q2: "10_to_30",
    q3: ["quote"],
    q4: "personal",
    q5: "files",
    q6: "speed",
    q7: "within_3_months",
    q8: "self_decide",
    q9: "under_4h",
    ...overrides,
  };
}
```

`baseSummary()` 헬퍼(20~41번째 줄)에 `safetyDocsBranch: false` 추가:

```ts
function baseSummary(overrides: Partial<AxCheckSummary> = {}): AxCheckSummary {
  return {
    priorities: [
      {
        title: "제안서·견적서 자동 초안 생성",
        why: "과거 제안서·견적 데이터를 기반으로 반복 작성 시간을 줄일 수 있습니다.",
        echo: "'제안서·견적서 작성'을(를) 가장 시간이 많이 드는 업무로 꼽아주셨습니다.",
        industryExample: "예: BOM·회선 구성 기반 제안 초안 자동 생성",
        roadmap: [
          "최근 1년 제안서·견적서 20건 정리",
          "표준 템플릿 3종 확정 후 AI 초안 도구로 파일럿 5건 작성",
          "실제 제안 건에 적용해 작성 시간 정착, 월별 절감 시간 측정",
        ],
        expectedEffect: "작성 시간 40~60%↓ (일반적 도입 사례 기준, 실제 효과는 상담 후 안내)",
      },
    ],
    grade: "HOT",
    score: 320,
    catalogVersion: "v3",
    safetyDocsBranch: false,
    ...overrides,
  };
}
```

파일 끝에 새 describe 블록 추가:

```ts
describe("buildCustomerEmailDraft — 안전서류 분기 블록", () => {
  it("safetyDocsBranch: false면 분기 블록을 넣지 않는다", () => {
    const draft = buildCustomerEmailDraft(
      baseAnswers(),
      baseSummary({ safetyDocsBranch: false }),
      { company: "테스트회사", name: "홍길동" },
      { mode: "auto" }
    );
    expect(draft.body).not.toContain(SAFETY_DOCS_BRANCH_COPY.resultHeadline);
  });

  it("safetyDocsBranch: true면 분기 블록 + 한 줄 추가 문구를 T1 본문에 넣는다(auto 모드)", () => {
    const draft = buildCustomerEmailDraft(
      baseAnswers({ q9: "4_8h" }),
      baseSummary({ safetyDocsBranch: true }),
      { company: "테스트회사", name: "홍길동" },
      { mode: "auto" }
    );
    expect(draft.body).toContain(SAFETY_DOCS_BRANCH_COPY.resultHeadline);
    expect(draft.body).toContain(SAFETY_DOCS_BRANCH_COPY.resultBody);
    expect(draft.body).toContain(SAFETY_DOCS_BRANCH_COPY.emailExtraLine);
  });

  it("caseStudyUrl이 있으면 사례 PDF 링크 줄을 포함한다", () => {
    const draft = buildCustomerEmailDraft(
      baseAnswers({ q9: "4_8h" }),
      baseSummary({ safetyDocsBranch: true }),
      { company: "테스트회사", name: "홍길동" },
      { mode: "auto", links: { caseStudyUrl: "https://www.coredxi.com/docs/safety-rag-case-study.pdf" } }
    );
    expect(draft.body).toContain("https://www.coredxi.com/docs/safety-rag-case-study.pdf");
  });

  it("caseStudyUrl이 없으면 사례 PDF 링크 줄이 빠진다", () => {
    const draft = buildCustomerEmailDraft(
      baseAnswers({ q9: "4_8h" }),
      baseSummary({ safetyDocsBranch: true }),
      { company: "테스트회사", name: "홍길동" },
      { mode: "auto" }
    );
    expect(draft.body).not.toContain(".pdf");
  });

  it("데모 신청 CTA 링크(source=safety_docs)를 항상 포함한다(분기 ON일 때)", () => {
    const draft = buildCustomerEmailDraft(
      baseAnswers({ q9: "4_8h" }),
      baseSummary({ safetyDocsBranch: true }),
      { company: "테스트회사", name: "홍길동" },
      { mode: "auto" }
    );
    expect(draft.body).toContain("source=safety_docs");
  });

  it("금지 표현을 포함하지 않는다", () => {
    const draft = buildCustomerEmailDraft(
      baseAnswers({ q9: "over_16h" }),
      baseSummary({ safetyDocsBranch: true }),
      { company: "테스트회사", name: "홍길동" },
      { mode: "auto" }
    );
    expect(draft.body).not.toContain("AI로 위험성평가표를 만들어");
  });
});
```

테스트 상단 import에 `SAFETY_DOCS_BRANCH_COPY` 추가:

```ts
import { SALES_SIGNATURE, SAFETY_DOCS_BRANCH_COPY } from "./catalog";
```

- [ ] **Step 2: 테스트 실행 → 실패 확인**

Run: `npm run test -- email-draft.test.ts`
Expected: FAIL — `links` 파라미터 미지원, 분기 블록 문자열이 본문에 없음.

- [ ] **Step 3: email-draft.ts 구현**

Import에 `SAFETY_DOCS_BRANCH_COPY`, `SAFETY_DOCS_DEMO_SOURCE` 추가(15~22번째 줄):

```ts
import {
  FOLLOWUP_COPY,
  SAFETY_DOCS_BRANCH_COPY,
  SAFETY_DOCS_DEMO_SOURCE,
  escapeHtml,
  getOptionLabel,
  getQuestionById,
  renderSignatureBlock,
  renderSignatureBlockHtml,
} from "./catalog";
```

파일에 헬퍼 함수 추가(`formatPriorityBlock` 아래, `buildCustomerEmailDraft` 위):

```ts
/**
 * 안전서류 분기(summary.safetyDocsBranch) 블록 본문 — T1(상세본) 끝에 붙는다.
 * caseStudyUrl이 없으면 "도입 사례 보기(PDF)" 줄을 생략한다(AX_CHECK_BROCHURE_URL과 동일 관례).
 */
function buildSafetyDocsBranchLines(caseStudyUrl?: string | null): string[] {
  const demoUrl = `https://www.coredxi.com/contact?source=${SAFETY_DOCS_DEMO_SOURCE}`;
  const lines = [
    "",
    SAFETY_DOCS_BRANCH_COPY.resultHeadline,
    SAFETY_DOCS_BRANCH_COPY.resultBody,
  ];
  if (caseStudyUrl) {
    lines.push(`${SAFETY_DOCS_BRANCH_COPY.caseStudyCtaLabel}: ${caseStudyUrl}`);
  }
  lines.push(`${SAFETY_DOCS_BRANCH_COPY.demoCtaLabel}: ${demoUrl}`);
  lines.push("", SAFETY_DOCS_BRANCH_COPY.emailExtraLine);
  return lines;
}
```

`buildCustomerEmailDraft` 시그니처와 auto 분기 본문(67~101번째 줄) 수정:

```ts
export function buildCustomerEmailDraft(
  answers: AxCheckAnswers,
  summary: AxCheckSummary,
  contact: { company: string; name: string },
  opts?: { mode?: "manual" | "auto"; links?: { caseStudyUrl?: string | null } }
): AxCheckEmailDraft {
  const mode = opts?.mode ?? "manual";
  const { company, name } = contact;
  const industryLabel = getOptionLabel(getQuestionById("q1"), answers.q1);
  const priorityLines = summary.priorities.flatMap((p, i) => formatPriorityBlock(p, i));
  const count = summary.priorities.length;
  const safetyDocsLines = summary.safetyDocsBranch
    ? buildSafetyDocsBranchLines(opts?.links?.caseStudyUrl)
    : [];

  if (mode === "auto") {
    const body = [
      FOLLOWUP_COPY.t1.greeting(company, name),
      "",
      FOLLOWUP_COPY.t1.introLine(industryLabel, count),
      FOLLOWUP_COPY.t1.introLine2,
      "",
      ...priorityLines,
      FOLLOWUP_COPY.t1.processParagraph,
      "",
      FOLLOWUP_COPY.t1.callToAction(company),
      ...safetyDocsLines,
      "",
      FOLLOWUP_COPY.optOutNotice,
      "",
      renderSignatureBlock(),
    ].join("\n");

    return {
      subject: FOLLOWUP_COPY.t1.subject(company, count),
      body,
      html: wrapEmailBodyAsHtml(body),
    };
  }

  const body = [
    `${company} ${name}님, 안녕하세요.`,
    "",
    `AX 체크 진단에 참여해 주셔서 감사합니다. ${industryLabel} 기준으로 정리한 귀사의 AX 우선 과제입니다.`,
    "",
    ...priorityLines,
    "CoreDXI는 진단(2주) → 설계 → 구축 → 교육 순서로 프로젝트를 진행합니다. 반복 업무를 실제로 줄이는 것까지 함께 챙깁니다.",
    ...safetyDocsLines,
    "",
    "[[통화에서 말씀 주신 ___ 관련해서는 별도로 안내드리겠습니다.]]",
    "",
    "편하신 시간에 30분 정도 통화하며 자세히 설명드리고 싶습니다. 이 메일에 회신해 주시면 일정을 조율하겠습니다.",
    "",
    renderSignatureBlock(),
  ].join("\n");

  return {
    subject: `[CoreDXI] ${company} AX 체크 결과 — 귀사의 우선 과제 ${count}가지`,
    body,
    html: wrapEmailBodyAsHtml(body),
  };
}
```

`demoUrl`을 `https://www.coredxi.com/...`로 하드코딩한 이유: email-draft.ts는 "순수 함수, DB 저장 없음"(파일 상단 독스트링)을 유지해야 하므로 `NEXTAUTH_URL` 같은 서버 환경변수를 읽지 않는다. `getEmailLogoUrl()`도 같은 이유로 `catalog.ts`에서만 환경변수를 읽고 email-draft.ts에는 완성된 문자열만 넘긴다 — 그 패턴을 따라 여기서도 프로덕션 고정 도메인을 상수로 박아 둔다(로고 URL과 달리 프리뷰 환경을 구분할 필요가 없는 링크라 `NEXTAUTH_URL` 없이도 무방).

- [ ] **Step 4: 테스트 실행 → 통과 확인**

Run: `npm run test -- email-draft.test.ts`
Expected: PASS(기존 전부 + 신규 6개)

- [ ] **Step 5: 커밋**

```bash
git add src/lib/ax-check/email-draft.ts src/lib/ax-check/email-draft.test.ts
git commit -m "feat(ax-check): T1 상세본에 안전서류 분기 블록 삽입

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 4: types.ts + actions/ax-check.ts — 저장·조회·영업 알림 반영

**Files:**
- Modify: `src/lib/ax-check/types.ts`
- Modify: `src/actions/ax-check.ts`
- Test: `src/actions/ax-check.test.ts`

**Interfaces:**
- Consumes: `summarizeAxCheck()`(Task 2), `getSafetyDocsCaseStudyUrl()`·`SAFETY_DOCS_BRANCH_ON_VALUES`(Task 1)
- Produces: `AxCheckSubmitResult`(success)에 `safetyDocsBranch: boolean; caseStudyUrl: string | null` 추가, `AxCheckResultPageData`에 동일 필드 추가. Task 6(AxCheckForm/결과 페이지)이 그대로 소비한다.

- [ ] **Step 1: 실패하는 테스트 작성**

`src/actions/ax-check.test.ts`의 `validAnswers()` 헬퍼(78~90번째 줄)에 `q9` 기본값 추가(분기 OFF):

```ts
function validAnswers(overrides: Record<string, unknown> = {}) {
  return {
    q1: "network",
    q2: "10_to_30",
    q3: ["quote", "bidding"],
    q4: "personal",
    q5: "files",
    q6: "speed",
    q7: "within_3_months",
    q8: "self_decide",
    q9: "under_4h",
    ...overrides,
  };
}
```

`describe("submitAxCheck validation")` 다음(또는 성공 케이스를 다루는 기존 describe 블록 끝)에 새 블록 추가 — 정확한 삽입 위치는 파일을 열어 기존 "successful submission" 계열 describe 바로 뒤에 붙인다:

```ts
describe("submitAxCheck — 안전서류 분기(Q9)", () => {
  it("Q9가 4_8h/8_16h/over_16h면 safetyDocsBranch: true와 caseStudyUrl을 반환한다", async () => {
    process.env.AX_CHECK_SAFETY_CASE_STUDY_URL = "https://www.coredxi.com/docs/safety-rag-case-study.pdf";
    const result = await submitAxCheck(
      validInput({ answers: validAnswers({ q9: "4_8h" }) })
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.safetyDocsBranch).toBe(true);
      expect(result.caseStudyUrl).toBe("https://www.coredxi.com/docs/safety-rag-case-study.pdf");
    }
    delete process.env.AX_CHECK_SAFETY_CASE_STUDY_URL;
  });

  it("Q9가 under_4h면 safetyDocsBranch: false를 반환한다", async () => {
    const result = await submitAxCheck(
      validInput({ answers: validAnswers({ q9: "under_4h" }) })
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.safetyDocsBranch).toBe(false);
    }
  });

  it("caseStudyUrl 미설정 시 null을 반환한다", async () => {
    delete process.env.AX_CHECK_SAFETY_CASE_STUDY_URL;
    const result = await submitAxCheck(
      validInput({ answers: validAnswers({ q9: "over_16h" }) })
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.caseStudyUrl).toBeNull();
    }
  });

  it("분기 ON이면 영업이사 알림 메일에 24시간 액션 안내 줄을 넣는다", async () => {
    process.env.SALES_NOTIFY_EMAIL = "sales@coredxi.com";
    await submitAxCheck(validInput({ answers: validAnswers({ q9: "8_16h" }) }));

    const salesCall = sendResendEmailMock.mock.calls.find(
      (call) => call[0]?.to === "sales@coredxi.com"
    );
    expect(salesCall?.[0]?.text).toContain("안전서류 분기 ON");
  });

  it("분기 OFF면 영업이사 알림 메일에 안전서류 안내 줄이 없다", async () => {
    process.env.SALES_NOTIFY_EMAIL = "sales@coredxi.com";
    await submitAxCheck(validInput({ answers: validAnswers({ q9: "none" }) }));

    const salesCall = sendResendEmailMock.mock.calls.find(
      (call) => call[0]?.to === "sales@coredxi.com"
    );
    expect(salesCall?.[0]?.text).not.toContain("안전서류 분기 ON");
  });
});

describe("getAxCheckResultByToken — 안전서류 분기", () => {
  it("summary.safetyDocsBranch가 true인 레코드는 safetyDocsBranch: true를 반환한다", async () => {
    prismaMock.axCheckResponse.findUnique.mockResolvedValue({
      company: "테스트회사",
      summary: { priorities: [], safetyDocsBranch: true },
    });
    const result = await getAxCheckResultByToken("tok");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.safetyDocsBranch).toBe(true);
    }
  });

  it("구버전 레코드(safetyDocsBranch 필드 없음)는 false로 안전하게 처리한다", async () => {
    prismaMock.axCheckResponse.findUnique.mockResolvedValue({
      company: "테스트회사",
      summary: { priorities: [] },
    });
    const result = await getAxCheckResultByToken("tok");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.safetyDocsBranch).toBe(false);
    }
  });
});
```

- [ ] **Step 2: 테스트 실행 → 실패 확인**

Run: `npm run test -- ax-check.test.ts`
Expected: FAIL — `result.safetyDocsBranch`/`result.caseStudyUrl`/`result.data.safetyDocsBranch`가 `undefined`, 영업 알림 본문에 "안전서류 분기 ON" 없음.

- [ ] **Step 3: types.ts 구현**

`AxCheckSubmitResult`(27~30번째 줄) 수정:

```ts
export type AxCheckSubmitResult =
  /** t0Sent — T0(즉시 요약) 메일이 실제로 발송됐는지. 결과 화면 문구가 이 값에 따라 달라진다. */
  | {
      success: true;
      priorities: AxCheckPriority[];
      resultToken: string;
      t0Sent: boolean;
      /** Q9(안전서류 작성 시간) 월 4시간 이상 — 결과 화면 분기 블록 노출 여부. */
      safetyDocsBranch: boolean;
      /** 안전서류 도입 사례 PDF URL. 미설정이면 null(해당 CTA 숨김). */
      caseStudyUrl: string | null;
    }
  | { success: false; error: string };
```

`AxCheckResultPageData`(80~84번째 줄) 수정:

```ts
/** /ax-check/result/[token] — 등급·이메일·전화번호 등 내부용 필드는 제외한 공개 조회 결과. */
export type AxCheckResultPageData = {
  company: string;
  priorities: AxCheckPriority[];
  safetyDocsBranch: boolean;
  caseStudyUrl: string | null;
};
```

- [ ] **Step 4: actions/ax-check.ts 구현**

Import에 `getSafetyDocsCaseStudyUrl` 추가(26~33번째 줄):

```ts
import {
  AX_CHECK_QUESTIONS,
  Q3_MAX_SELECT,
  SALES_SIGNATURE,
  getOptionLabel,
  getQuestionById,
  getSafetyDocsCaseStudyUrl,
  type AxCheckQuestion,
} from "@/lib/ax-check/catalog";
```

`submitAxCheck` 내부 — `summarizeAxCheck` 호출부(142번째 줄) 수정:

```ts
  const { priorities, grade, score, catalogVersion, safetyDocsBranch } = summarizeAxCheck(
    input.answers
  );
  const resultToken = generateAxCheckResultToken();
  const caseStudyUrl = getSafetyDocsCaseStudyUrl();
```

`prisma.axCheckResponse.create` 호출부의 `summary` 필드(161번째 줄) 수정:

```ts
        summary: { priorities, safetyDocsBranch },
```

영업이사 알림 메일 본문(226~262번째 줄)의 "통화 포인트" 블록에 분기 ON 줄 추가:

```ts
      text: [
        "새 AX 체크 응답이 접수되었습니다.",
        "",
        `회사: ${company}`,
        `담당자: ${name}`,
        `이메일: ${email}`,
        `연락처: ${phone || "-"}`,
        `유입 경로(ref): ${refCode ?? "-"}`,
        `등급: ${grade}`,
        "",
        "통화 포인트",
        `- 가장 시간이 드는 업무: ${q3Labels.join(", ")}`,
        `- 검토 시점: ${q7Label}`,
        `- 의사결정 구조: ${q8Label}`,
        ...(safetyDocsBranch
          ? [
              "- ⚠ 안전서류 분기 ON — 24시간 내 사례 PDF 카톡 발송 + 10분 데모 제안, 노션 로그에 회사명·응답 구간·반응 기록",
            ]
          : []),
        "",
        followupEnabled
          ? `상세 진단 메일 예정: ${formatKstFollowupSchedule(followupScheduledAt)}`
          : "상세 진단 메일: 자동 발송 꺼짐(HELD) — 관리자 페이지에서 직접 처리해 주세요.",
        `보류·수정·지금 보내기: ${adminLink}`,
        `결과 재열람 링크: ${resultUrl}`,
      ].join("\n"),
```

함수 마지막 반환문(269번째 줄) 수정:

```ts
  return { success: true, priorities, resultToken, t0Sent, safetyDocsBranch, caseStudyUrl };
```

`getAxCheckResultByToken`(272~297번째 줄) 수정:

```ts
export async function getAxCheckResultByToken(token: string): Promise<AxCheckResultLookupResult> {
  const trimmed = token.trim();
  if (!trimmed) {
    return { success: false, error: "유효하지 않은 결과 링크입니다." };
  }

  try {
    const response = await prisma.axCheckResponse.findUnique({
      where: { resultToken: trimmed },
      select: { company: true, summary: true },
    });

    if (!response) {
      return { success: false, error: "유효하지 않은 결과 링크입니다." };
    }

    const summary = response.summary as unknown as {
      priorities: AxCheckLeadRecord["priorities"];
      safetyDocsBranch?: boolean;
    };
    return {
      success: true,
      data: {
        company: response.company,
        priorities: normalizeLegacyPriorities(summary.priorities),
        // 구버전 레코드(이 필드 추가 전 응답)는 분기 없음으로 안전하게 처리한다.
        safetyDocsBranch: summary.safetyDocsBranch ?? false,
        caseStudyUrl: getSafetyDocsCaseStudyUrl(),
      },
    };
  } catch (e) {
    console.error("[getAxCheckResultByToken]", e);
    return { success: false, error: "결과를 불러오는 중 오류가 발생했습니다." };
  }
}
```

`caseStudyUrl`을 저장하지 않고 매 조회마다 새로 읽는 이유: PDF가 나중에 준비되면(환경변수만 등록하면) 이미 발송된 옛 메일의 재열람 링크(`/ax-check/result/[token]`)도 다시 열었을 때 곧바로 버튼이 뜨게 하기 위함 — `brochureUrl`이 이미 이렇게 동작한다(CONTENT_GUIDE.md 18번, "URL을 비워 저장하면 버튼이 사라집니다").

- [ ] **Step 5: 테스트 실행 → 통과 확인**

Run: `npm run test -- ax-check.test.ts`
Expected: PASS(기존 전부 + 신규 7개)

- [ ] **Step 6: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음(Task 6·7·8에서 소비하는 쪽을 아직 안 고쳤다면 여기서 여러 개 뜰 수 있다 — Task 6 완료 후 다시 확인)

- [ ] **Step 7: 커밋**

```bash
git add src/lib/ax-check/types.ts src/actions/ax-check.ts src/actions/ax-check.test.ts
git commit -m "feat(ax-check): 제출/조회 결과에 safetyDocsBranch·caseStudyUrl 반영, 영업 알림에 분기 ON 표시

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 5: followup.ts — T1 자동 발송에도 caseStudyUrl 반영

**Files:**
- Modify: `src/lib/ax-check/followup.ts`
- Test: `src/lib/ax-check/followup.test.ts`

**Interfaces:**
- Consumes: `buildCustomerEmailDraft(..., { mode: "auto", links: { caseStudyUrl } })`(Task 3), `getSafetyDocsCaseStudyUrl()`(Task 1)

`submitAxCheck`이 보내는 T0/영업 알림과 달리, T1은 제출 시점이 아니라 D+2 영업일에 **크론이** 발송한다(`processDueFollowups` → `sendFollowupEmail`). 이때도 `caseStudyUrl`을 다시 읽어야 발송 시점 기준 최신 PDF 링크가 들어간다.

- [ ] **Step 1: 실패하는 테스트 작성**

`followup.test.ts`의 `baseRecord()` 헬퍼(26~61번째 줄) `summary` 필드에 `safetyDocsBranch` 추가:

```ts
    summary: {
      priorities: [
        {
          title: "제안서·견적서 자동 초안 생성",
          why: "이유",
          echo: "echo",
          industryExample: null,
          roadmap: ["1주차", "1개월차", "3개월차"],
          expectedEffect: "효과",
        },
      ],
      safetyDocsBranch: false,
    },
```

`describe("sendFollowupEmail")` 안에 새 테스트 추가(기존 "초안이 없으면 buildCustomerEmailDraft로 새로 만든다" 류 테스트 근처):

```ts
it("safetyDocsBranch: true인 레코드는 caseStudyUrl을 담아 자동 발송 초안을 만든다", async () => {
  process.env.AX_CHECK_SAFETY_CASE_STUDY_URL = "https://www.coredxi.com/docs/safety-rag-case-study.pdf";
  prismaMock.axCheckResponse.updateMany.mockResolvedValue({ count: 1 });
  prismaMock.axCheckResponse.findUnique.mockResolvedValue(
    baseRecord({
      summary: {
        priorities: [
          {
            title: "제안서·견적서 자동 초안 생성",
            why: "이유",
            echo: "echo",
            industryExample: null,
            roadmap: ["1주차", "1개월차", "3개월차"],
            expectedEffect: "효과",
          },
        ],
        safetyDocsBranch: true,
      },
    })
  );
  prismaMock.axCheckResponse.update.mockResolvedValue({});

  await sendFollowupEmail("lead-1");

  const sentBody = sendResendEmailMock.mock.calls[0]?.[0]?.text as string;
  expect(sentBody).toContain("https://www.coredxi.com/docs/safety-rag-case-study.pdf");
  delete process.env.AX_CHECK_SAFETY_CASE_STUDY_URL;
});
```

- [ ] **Step 2: 테스트 실행 → 실패 확인**

Run: `npm run test -- followup.test.ts`
Expected: FAIL — 발송 본문에 PDF URL이 없음(아직 `followup.ts`가 `links`를 안 넘김).

- [ ] **Step 3: followup.ts 구현**

Import에 `getSafetyDocsCaseStudyUrl` 추가(13번째 줄):

```ts
import { SALES_SIGNATURE, getSafetyDocsCaseStudyUrl } from "./catalog";
```

`sendFollowupEmail` 내부 `buildCustomerEmailDraft` 호출부(66~77번째 줄) 수정:

```ts
    if (!subject || !body) {
      const summary = record.summary as unknown as {
        priorities: unknown;
        safetyDocsBranch?: boolean;
      };
      const draft = buildCustomerEmailDraft(
        record.answers as AxCheckAnswers,
        {
          priorities: normalizeLegacyPriorities(summary.priorities),
          grade: record.grade,
          score: record.score,
          catalogVersion: record.catalogVersion,
          safetyDocsBranch: summary.safetyDocsBranch ?? false,
        },
        { company: record.company, name: record.name },
        { mode: "auto", links: { caseStudyUrl: getSafetyDocsCaseStudyUrl() } }
      );
      subject = subject ?? draft.subject;
      body = body ?? draft.body;
    }
```

- [ ] **Step 4: 테스트 실행 → 통과 확인**

Run: `npm run test -- followup.test.ts`
Expected: PASS(기존 전부 + 신규 1개)

- [ ] **Step 5: 커밋**

```bash
git add src/lib/ax-check/followup.ts src/lib/ax-check/followup.test.ts
git commit -m "feat(ax-check): T1 자동 발송(followup.ts)에도 안전서류 사례 PDF 링크 반영

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 6: AxCheckForm.tsx + AxCheckPriorityCards.tsx — Q9 입력 + 결과 화면 분기 블록

**Files:**
- Modify: `src/app/ax-check/AxCheckForm.tsx`
- Modify: `src/components/ax-check/AxCheckPriorityCards.tsx`
- Modify: `src/app/ax-check/result/[token]/page.tsx`

**Interfaces:**
- Consumes: `AxCheckSubmitResult`/`AxCheckResultPageData`의 `safetyDocsBranch`·`caseStudyUrl`(Task 4), `SAFETY_DOCS_BRANCH_COPY`·`SAFETY_DOCS_DEMO_SOURCE`(Task 1)

이 컴포넌트들에는 기존 테스트 파일이 없다(현재 테스트 스위트가 lib 레이어만 덮는 기존 관례를 따른다) — 검증은 Task 9의 E2E로 한다.

- [ ] **Step 1: AxCheckForm.tsx — Q9 입력은 기존 마법사 루프가 자동 처리**

`AX_CHECK_QUESTIONS`가 9개가 되면 `TOTAL_STEPS`(`AX_CHECK_QUESTIONS.length + 1`)도 자동으로 10이 되고, `QuestionStep`은 `question.type === "single"`이면 그대로 라디오 목록을 렌더링하므로 **Q9 입력 UI 자체는 코드 변경이 필요 없다**. 딱 하나, `EMPTY_ANSWERS`(30~40번째 줄)에 `q9` 초기값을 추가해야 한다:

```ts
const EMPTY_ANSWERS: AxCheckAnswers = {
  q1: "",
  q2: "",
  q3: [],
  q3Other: "",
  q4: "",
  q5: "",
  q6: "",
  q7: "",
  q8: "",
  q9: "",
};
```

- [ ] **Step 2: AxCheckForm.tsx — 제출 결과에서 분기 정보 받기**

state 선언부(68~70번째 줄) 다음에 추가:

```ts
  const [priorities, setPriorities] = useState<AxCheckPriority[] | null>(null);
  // T0 요약 메일이 실제로 발송된 경우에만 결과 화면에서 "메일을 보내드렸습니다"를 표시한다.
  const [t0Sent, setT0Sent] = useState(false);
  const [safetyDocsBranch, setSafetyDocsBranch] = useState(false);
  const [caseStudyUrl, setCaseStudyUrl] = useState<string | null>(null);
```

`handleSubmit` 안의 성공 처리(140~142번째 줄) 수정:

```ts
      trackEvent("ax_check_submit", { source: refCode ?? "direct" });
      setT0Sent(result.t0Sent);
      setPriorities(result.priorities);
      setSafetyDocsBranch(result.safetyDocsBranch);
      setCaseStudyUrl(result.caseStudyUrl);
```

결과 화면 렌더 분기(153~163번째 줄) 수정:

```ts
  if (priorities) {
    return (
      <div className="space-y-4">
        {t0Sent ? (
          <p className="text-center text-sm text-muted-foreground">
            결과 요약 메일을 {contact.email}로 보내드렸습니다.
          </p>
        ) : null}
        <AxCheckPriorityCards
          company={contact.company}
          priorities={priorities}
          safetyDocsBranch={safetyDocsBranch}
          caseStudyUrl={caseStudyUrl}
        />
      </div>
    );
  }
```

- [ ] **Step 3: 결과 재열람 페이지에도 동일하게 전달**

`src/app/ax-check/result/[token]/page.tsx`의 `<AxCheckPriorityCards>` 호출부(36~39번째 줄) 수정:

```tsx
          <AxCheckPriorityCards
            company={result.data.company}
            priorities={result.data.priorities}
            safetyDocsBranch={result.data.safetyDocsBranch}
            caseStudyUrl={result.data.caseStudyUrl}
          />
```

- [ ] **Step 4: AxCheckPriorityCards.tsx — 분기 블록 UI 추가**

Import에 `SAFETY_DOCS_BRANCH_COPY`, `SAFETY_DOCS_DEMO_SOURCE` 추가(8~10번째 줄):

```tsx
import { ArrowRight, FileText, Lightbulb } from "lucide-react";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { SAFETY_DOCS_BRANCH_COPY, SAFETY_DOCS_DEMO_SOURCE } from "@/lib/ax-check/catalog";
import type { AxCheckPriority } from "@/lib/ax-check/summarize";
```

`Props` 타입(12~15번째 줄) 수정:

```tsx
type Props = {
  company?: string;
  priorities: AxCheckPriority[];
  /** Q9(안전서류 작성 시간) 월 4시간 이상 응답 — true면 아래 안전서류 분기 블록을 보여준다. */
  safetyDocsBranch?: boolean;
  /** 안전서류 도입 사례 PDF URL. null/undefined면 "도입 사례 보기(PDF)" 버튼을 숨긴다. */
  caseStudyUrl?: string | null;
};
```

함수 시그니처와 본문(17~85번째 줄)에서, 기존 `<div className="mt-8 flex flex-col gap-2.5">`(담당자와 상담하기 CTA) **앞에** 분기 블록을 삽입:

```tsx
export function AxCheckPriorityCards({
  company,
  priorities,
  safetyDocsBranch,
  caseStudyUrl,
}: Props) {
  return (
    <div className="mx-auto w-full max-w-md">
      {/* ...기존 헤더·ol 목록은 그대로... */}

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
```

`<a>` 태그의 `onClick`에서 `trackEvent`를 쓰므로 import 목록에 `trackEvent`도 추가해야 한다(`@/lib/ga4-events`):

```tsx
import { trackEvent } from "@/lib/ga4-events";
```

- [ ] **Step 5: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 6: 커밋**

```bash
git add src/app/ax-check/AxCheckForm.tsx src/components/ax-check/AxCheckPriorityCards.tsx src/app/ax-check/result/\[token\]/page.tsx
git commit -m "feat(ax-check): Q9 입력 + 결과 화면 안전서류 분기 블록(사례 PDF·10분 데모 CTA)

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 7: /contact — source=safety_docs 처리("별도 폼 만들지 않음")

**Files:**
- Modify: `src/app/contact/page.tsx`
- Modify: `src/app/contact/ContactPageClient.tsx`

**Interfaces:**
- Consumes: `SAFETY_DOCS_DEMO_SOURCE`·`SAFETY_DOCS_DEMO_INQUIRY_TYPE`(Task 1)
- Produces: `submitContactForm({ type: SAFETY_DOCS_DEMO_INQUIRY_TYPE, ... })` — Task 10(관리자 안내 문서)이 이 문자열로 데모 신청 건수를 센다.

`contacts` 테이블은 Supabase에 직접 생성된 테이블(Prisma 관리 밖)이라 CLAUDE.md 금지 규칙(`prisma migrate dev`로 인한 충돌 위험) 대상이다. 새 컬럼을 추가하지 않고 기존 `type` 컬럼에 고정 라벨을 넣는 방식으로 스키마 변경을 완전히 피한다.

- [ ] **Step 1: contact/page.tsx — source 쿼리 전달**

`searchParams`를 받아 클라이언트로 넘긴다(`/admin/leads/page.tsx`의 기존 패턴과 동일):

```tsx
export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string }>;
}) {
  const notificationEmail = await getContactNotificationEmail();
  const faqJsonLd = buildFaqJsonLd(CONTACT_FAQ_ITEMS);
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const { source } = await searchParams;

  return (
    <>
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <ContactPageClient
        notificationEmail={notificationEmail}
        faqItems={CONTACT_FAQ_ITEMS}
        source={source}
      />
    </>
  );
}
```

- [ ] **Step 2: ContactPageClient.tsx — source=safety_docs일 때 문의 유형 고정 + 안내 배너**

Import에 상수 추가(1~20번째 줄 부근):

```tsx
import { SAFETY_DOCS_DEMO_INQUIRY_TYPE, SAFETY_DOCS_DEMO_SOURCE } from "@/lib/ax-check/catalog";
```

`Props` 타입(37~40번째 줄) 수정:

```tsx
type Props = {
  notificationEmail: string;
  faqItems: ContactFaqItem[];
  source?: string;
};
```

컴포넌트 시그니처와 초기 state(42~48번째 줄) 수정 — `isSafetyDocsDemo` 파생값과 message 기본값을 추가:

```tsx
export function ContactPageClient({ notificationEmail, faqItems, source }: Props) {
  const isSafetyDocsDemo = source === SAFETY_DOCS_DEMO_SOURCE;
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [inquiryType, setInquiryType] = useState("");
  const [message, setMessage] = useState(
    isSafetyDocsDemo
      ? "현장 안전서류(위험성평가표·표준작업계획서·TBM일지) 관련 10분 데모를 요청합니다."
      : ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
```

`handleSubmit`(55~93번째 줄) 수정 — `isSafetyDocsDemo`면 문의 유형 검증·매핑을 건너뛰고 고정 라벨을 쓴다:

```tsx
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isSafetyDocsDemo && !inquiryType) {
      alert("문의 유형을 선택해 주세요.");
      return;
    }

    const typeLabel = isSafetyDocsDemo
      ? SAFETY_DOCS_DEMO_INQUIRY_TYPE
      : (INQUIRY_TYPE_OPTIONS.find((o) => o.value === inquiryType)?.label ?? inquiryType);

    setIsSubmitting(true);
    try {
      const result = await submitContactForm({
        firstName,
        lastName,
        email,
        type: typeLabel,
        message,
      });

      if (!result.success) {
        alert(result.error ?? "문의 접수에 실패했습니다.");
        return;
      }

      trackEvent("contact_submit", { source: source ?? "direct" });
      alert(
        "문의가 성공적으로 접수되었습니다. 영업일 기준 1~2일 내로 연락드리겠습니다."
      );
      setFirstName("");
      setLastName("");
      setEmail("");
      setInquiryType("");
      setMessage(isSafetyDocsDemo ? message : "");
    } finally {
      setIsSubmitting(false);
    }
  }
```

문의 유형 select 블록(146~167번째 줄)을 `isSafetyDocsDemo` 여부로 분기 — 데모 신청이면 드롭다운 대신 고정 라벨을 보여준다:

```tsx
                {isSafetyDocsDemo ? (
                  <div className="space-y-1.5">
                    <Label>문의 유형</Label>
                    <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-foreground">
                      {SAFETY_DOCS_DEMO_INQUIRY_TYPE} (자동 설정)
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <Label htmlFor="inquiry-type">문의 유형</Label>
                    <Select
                      value={inquiryType}
                      onValueChange={(v) => {
                        if (v) setInquiryType(v);
                      }}
                    >
                      <SelectTrigger id="inquiry-type" className="w-full">
                        <SelectValue placeholder="선택해 주세요">
                          {selectedInquiryTypeLabel}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {INQUIRY_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
```

폼 상단(`<h1>이야기 나눠봐요</h1>` 다음 설명 문단 아래)에 짧은 안내 배너 추가:

```tsx
              {isSafetyDocsDemo ? (
                <p className="mt-4 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-foreground">
                  AX 체크에서 안전서류 데모 신청으로 와주셨네요. 아래 내용을 확인하고 제출해
                  주시면 담당 이사가 10분 데모 일정을 안내드립니다.
                </p>
              ) : null}
```

- [ ] **Step 3: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 4: 수동 확인(테스트 파일 없음 — 이 컴포넌트는 기존에도 테스트가 없다)**

Run: `npm run dev`, 브라우저에서 `/contact?source=safety_docs` 접속 → 문의 유형이 "안전서류 AI 도입 데모 신청 (자동 설정)"으로 고정되고, 안내 배너가 보이고, message 기본값이 채워져 있는지 확인. 제출 후 `/admin/contact`에서 해당 문의 유형으로 저장됐는지 확인.

- [ ] **Step 5: 커밋**

```bash
git add src/app/contact/page.tsx src/app/contact/ContactPageClient.tsx
git commit -m "feat(contact): source=safety_docs로 들어온 요청을 안전서류 데모 신청으로 자동 분류

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 8: AdminLeadsManager.tsx — Q9 분포·분기 ON 집계 스트립

**Files:**
- Modify: `src/app/admin/(panel)/leads/AdminLeadsManager.tsx`

**Interfaces:**
- Consumes: `AX_CHECK_QUESTIONS`, `SAFETY_DOCS_BRANCH_ON_VALUES`, `getOptionLabel`, `getQuestionById`(Task 1)

개별 리드의 Q9 답변은 `LeadDetailPanel.tsx`가 `AX_CHECK_QUESTIONS.map(...)`으로 전체 답변을 순회하며 이미 자동으로 보여준다 — **이 파일은 수정할 필요 없다.** 이 태스크는 스펙 5번의 "Q9 응답 분포(6개 구간별 건수), 분기 ON 건수"만 다룬다. "데모 신청 건수"는 이미 로드된 leads 배열에 없는 별도 데이터(Supabase `contacts` 테이블)라 이 스트립에 넣지 않고, `/admin/contact`에서 문의 유형 `SAFETY_DOCS_DEMO_INQUIRY_TYPE`으로 육안 확인하도록 Task 10에서 안내한다(스펙 5번이 요구하는 것도 "3개 숫자를 조회할 수 있으면 됨"이지 하나의 화면에 합치라는 요구는 아니다 — 이벤트 분석 SDK를 새로 넣지 않는다는 원칙과도 맞다).

- [ ] **Step 1: import 추가**

파일 상단 import 목록(1~15번째 줄)에 추가:

```tsx
import {
  AX_CHECK_QUESTIONS,
  SAFETY_DOCS_BRANCH_ON_VALUES,
  getOptionLabel,
  getQuestionById,
} from "@/lib/ax-check/catalog";
```

- [ ] **Step 2: Q9 집계 useMemo 추가**

`followupCounts` useMemo(88~96번째 줄) 다음에 추가:

```tsx
  const q9Question = getQuestionById("q9");
  const safetyDocsStats = useMemo(() => {
    if (!q9Question) return { branchOn: 0, distribution: [] as { label: string; count: number }[] };

    const counts = new Map<string, number>();
    for (const lead of leads) {
      const q9 = lead.answers.q9;
      if (typeof q9 !== "string" || !q9) continue;
      counts.set(q9, (counts.get(q9) ?? 0) + 1);
    }

    const distribution = q9Question.options.map((option) => ({
      label: option.label,
      count: counts.get(option.value) ?? 0,
    }));

    const branchOn = [...counts.entries()]
      .filter(([value]) => SAFETY_DOCS_BRANCH_ON_VALUES.has(value))
      .reduce((sum, [, count]) => sum + count, 0);

    return { branchOn, distribution };
  }, [leads, q9Question]);
```

`AxCheckLeadRecord["answers"]`에 아직 `q9`가 없다면(Task 2에서 `AxCheckAnswers`에 이미 추가했으므로 타입상으로는 존재) `lead.answers.q9`는 `string` 타입이다 — 위 코드의 `typeof q9 !== "string"`는 구버전(마이그레이션 전) 레코드가 `q9` 자체가 없는 경우를 방어하는 런타임 체크다.

`getOptionLabel`을 직접 쓰지 않고 `q9Question.options`를 순회하는 이유: 6개 구간을 스펙 순서 그대로, 응답 0건인 구간도 "0건"으로 보여주기 위함.

- [ ] **Step 3: UI에 집계 스트립 추가**

기존 4칸 통계 그리드(187~204번째 줄) 다음, `<LeadList>` 이전에 추가:

```tsx
      {q9Question ? (
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-slate-900">Q9 안전서류 분기 집계</p>
            <p className="text-xs text-slate-400">
              데모 신청 건수는 /admin/contact에서 &ldquo;{SAFETY_DOCS_DEMO_INQUIRY_TYPE}&rdquo; 유형으로 확인
            </p>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            분기 ON(월 4시간 이상): <span className="font-bold text-primary">{safetyDocsStats.branchOn}건</span>
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600 sm:grid-cols-3">
            {safetyDocsStats.distribution.map((d) => (
              <div key={d.label} className="flex justify-between gap-2">
                <dt className="truncate">{d.label}</dt>
                <dd className="font-semibold text-slate-800">{d.count}건</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
```

`SAFETY_DOCS_DEMO_INQUIRY_TYPE`을 import 목록에도 추가해야 한다(Step 1의 import 블록에 포함):

```tsx
import {
  AX_CHECK_QUESTIONS,
  SAFETY_DOCS_BRANCH_ON_VALUES,
  SAFETY_DOCS_DEMO_INQUIRY_TYPE,
  getOptionLabel,
  getQuestionById,
} from "@/lib/ax-check/catalog";
```

(`AX_CHECK_QUESTIONS`·`getOptionLabel`은 이 스트립 구현에서 실제로 쓰지 않으면 import에서 뺀다 — `getQuestionById`와 `SAFETY_DOCS_BRANCH_ON_VALUES`, `SAFETY_DOCS_DEMO_INQUIRY_TYPE`만 필요하면 그것만 남긴다. lint의 `no-unused-vars`가 이를 잡아준다.)

- [ ] **Step 4: 타입 체크 + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: 에러 없음

- [ ] **Step 5: 커밋**

```bash
git add "src/app/admin/(panel)/leads/AdminLeadsManager.tsx"
git commit -m "feat(admin): AX 체크 리드 관리 화면에 Q9 안전서류 분기 집계 스트립 추가

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 9: e2e/ax-check.spec.ts — 골든패스 갱신 + 분기 시나리오

**Files:**
- Modify: `e2e/ax-check.spec.ts`

Q9가 추가되면 기존 골든패스는 Q8 다음 "다음"을 누른 순간 연락처 단계 대신 Q9 화면을 만나 그대로 깨진다 — 이 수정 없이는 기존 테스트가 실패한다.

- [ ] **Step 1: Q8과 연락처 단계 사이에 Q9 응답 스텝 삽입**

`e2e/ax-check.spec.ts`의 Q8 단계(36~37번째 줄) 다음에 삽입 — 분기 ON 값을 선택해 이후 분기 블록도 같은 테스트로 검증한다:

```ts
  await page.getByRole("radio", { name: "제가 결정합니다" }).click();
  await page.getByRole("button", { name: "다음" }).click();

  // Q9 — 안전서류 분기 ON 값(월 4~8시간)을 선택해 결과 화면 분기 블록도 함께 검증한다.
  await page.getByRole("radio", { name: "월 4~8시간" }).click();
  await page.getByRole("button", { name: "다음" }).click();
```

- [ ] **Step 2: 제출 후 분기 블록 검증 추가**

기존 제출 후 검증(52~57번째 줄) 다음에 추가:

```ts
  // Q9에서 분기 ON 값을 선택했으므로 안전서류 블록·CTA가 함께 보여야 한다.
  await expect(page.getByText("현장 안전서류, 매번 새로 만들고 계시죠.")).toBeVisible();
  await expect(page.getByRole("link", { name: "10분 데모 신청" })).toHaveAttribute(
    "href",
    "/contact?source=safety_docs"
  );
```

- [ ] **Step 3: E2E 실행**

Run: `npm run test:e2e -- ax-check.spec.ts`
Expected: PASS. `E2E_ADMIN_EMAIL` 미설정 환경이면 관리자 로그인 이후 단계는 자동 skip(기존 동작 유지).

- [ ] **Step 4: 커밋**

```bash
git add e2e/ax-check.spec.ts
git commit -m "test(e2e): ax-check 골든패스에 Q9 스텝·안전서류 분기 블록 검증 추가

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 10: 문서화 + 사람이 할 일

**Files:**
- Modify: `CONTENT_GUIDE.md`
- Modify: `.env.example`
- Modify: `docs/TODO.md`

- [ ] **Step 1: .env.example에 새 환경변수 추가**

`AX_CHECK_BROCHURE_URL` 블록(96~98번째 줄) 다음에 추가:

```
# (선택) 안전서류 분기(Q9 월 4시간 이상) 결과 화면·T1 메일에 넣을 Safety-RAG 도입 사례 PDF 링크.
# 미설정 시 "도입 사례 보기(PDF)" 버튼이 통째로 빠진다("10분 데모 신청" 버튼은 그대로 노출).
# 참고: docs/20260910_전달_사내_SafetyRAG오너_AX체크안전서류분기전달물_v1.md
# AX_CHECK_SAFETY_CASE_STUDY_URL=
```

- [ ] **Step 2: CONTENT_GUIDE.md 17번 절에 안전서류 분기 안내 추가**

"질문지·과제 카드 문구를 바꾸고 싶다면" 절(658~666번째 줄) 다음에 새 소절 추가:

```markdown
### 안전서류 분기(Q9) 문구·임계값을 바꾸고 싶다면

> **2026-09-10 추가** — Safety-RAG 파일럿 후보 발굴용 분기. 상세:
> `docs/20260910_전달_사내_SafetyRAG오너_AX체크안전서류분기전달물_v1.md`

- Q9(안전서류 작성 시간) 문항, 분기 문구(결과 화면·T1 메일 공통), 임계값은 전부
  `src/lib/ax-check/catalog.ts`의 `Q9_SAFETY_DOCS_TIME`·`SAFETY_DOCS_BRANCH_COPY`·
  `SAFETY_DOCS_BRANCH_ON_VALUES`에 있습니다.
- **금지 표현**: "AI로 위험성평가표를 만들어 드립니다"(정부 KRAS가 무료 제공) — 어떤 문구
  수정에서도 이 표현은 쓰지 않습니다. "서류 세트를 귀사 공종·서식에 맞게 + 직접 구축·운영
  경험" 축을 유지해 주세요.
- 도입 사례 PDF는 Safety-RAG 오너로부터 최종본(`_draft` 제거본)을 받아 `public/docs/`에
  올린 뒤 Vercel 환경변수 `AX_CHECK_SAFETY_CASE_STUDY_URL`을 등록하면 결과 화면·메일에
  자동으로 링크가 뜹니다(미등록 상태에서는 "10분 데모 신청" 버튼만 보입니다).
- 임계값(현재 월 4시간 이상)을 바꾸려면 `SAFETY_DOCS_BRANCH_ON_VALUES`의 값 집합을
  수정합니다. 영업 전략과 직결되므로 개발팀·Safety-RAG 오너와 상의 후 진행합니다.

### 안전서류 분기 집계(Q9 분포·분기 ON·데모 신청) 확인하기

- `/admin/leads` 상단의 "Q9 안전서류 분기 집계" 카드에서 Q9 6개 구간별 응답 건수와
  "분기 ON(월 4시간 이상)" 합계를 바로 확인할 수 있습니다.
- 데모 신청 건수는 `/admin/contact`에서 문의 유형이 "안전서류 AI 도입 데모 신청"인
  건을 세면 됩니다(AX 체크 결과 화면의 "10분 데모 신청" 버튼을 누르면 이 유형으로
  자동 접수됩니다).
```

- [ ] **Step 3: docs/TODO.md에 진행 기록 추가**

Phase 1.5 항목 근처에 한 줄 추가(정확한 위치는 파일을 열어 최신 Phase 1.5 불릿 다음에 이어 붙인다):

```markdown
  - 🔧 **2026-09-10 안전서류 분기(Q9) 추가** — Safety-RAG 오너 분기 전달물(9/10, 9/9 전달 분 실행 큐 누락 재전달) 반영: `/ax-check`에 Q9(안전서류 작성 시간) 문항 추가, 월 4시간 이상 응답 시 결과 화면·T1 메일에 Safety-RAG 사례 PDF·10분 데모 CTA(`/contact?source=safety_docs`, 새 폼 없이 기존 문의 폼 재사용) 노출. DB 스키마 변경 없음(기존 `answers`/`summary` Json 컬럼 재사용). `/admin/leads`에 Q9 집계 스트립 추가. **후속(사용자)**: ① Safety-RAG 오너로부터 도입 사례 PDF 최종본 수령 → `public/docs/` 게시 → Vercel `AX_CHECK_SAFETY_CASE_STUDY_URL` 등록 ② 반영일을 Safety-RAG 오너 프로젝트에 통보(응답 집계 시작일로 기록, 스펙 6번 완료 기준).
```

- [ ] **Step 4: 커밋**

```bash
git add CONTENT_GUIDE.md .env.example docs/TODO.md
git commit -m "docs: 안전서류 분기(Q9) 문구 수정 가이드·환경변수·진행 기록 추가

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

- [ ] **Step 5: 최종 검증**

Run: `npm run lint && npx tsc --noEmit && npm run test`
Expected: 전부 통과. 이후 `npm run test:e2e -- ax-check.spec.ts`(Playwright, 로컬 서버 필요 시 `npm run dev` 별도 실행)도 통과 확인.

---

## 사람이 해야 할 일 (배포 후)

이 계획은 코드만 다룬다. 배포 후 다음은 개발 도구가 아니라 사람이 직접 해야 한다:

1. **Safety-RAG 도입 사례 PDF 확보** — Safety-RAG 오너로부터 `20260909_제안서_사내_SafetyRAG도입사례_v1`의 승인된 최종본(`_draft` 제거본)을 받아 `public/docs/safety-rag-case-study.pdf`(또는 원하는 파일명)로 저장, PR에 포함하거나 배포 후 덮어쓴다.
2. **Vercel 환경변수 등록** — Production/Preview에 `AX_CHECK_SAFETY_CASE_STUDY_URL=https://www.coredxi.com/docs/safety-rag-case-study.pdf` 등록 후 재배포(선택 — 미등록이어도 "10분 데모 신청" CTA는 정상 동작).
3. **실기기 테스트** — 모바일에서 `/ax-check?ref=...`로 Q9까지 9문항 완주 후 분기 ON 값을 선택했을 때 결과 화면·수신 메일(T0는 분기 블록 없음, T1은 D+2 영업일 후 분기 블록 있음)이 스펙대로 보이는지 확인. `/contact?source=safety_docs` 접속 시 문의 유형 자동 고정도 확인.
4. **Safety-RAG 오너에게 반영일 통보** — 스펙 6번 완료 기준의 마지막 항목("반영일을 Safety-RAG 오너 프로젝트에 알려준다, 응답 집계 시작일로 기록") — 배포일을 Notion Safety-RAG 프로젝트에 기록.
5. **11/30 재판단** — `/admin/leads` Q9 집계 + `/admin/contact` 데모 신청 건수로 스펙 5번의 3개 숫자를 모아 파일럿 후보 판단.
