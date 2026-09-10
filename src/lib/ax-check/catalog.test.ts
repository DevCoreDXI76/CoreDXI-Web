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
