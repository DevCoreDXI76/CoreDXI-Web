import { describe, expect, it } from "vitest";
import { templateKeyFromType } from "./contact-reply-templates";

describe("templateKeyFromType", () => {
  it.each([
    ["서비스 도입 및 견적 문의", "introduction"],
    ["제품 데모 시연 요청", "demo"],
    ["기능 및 기술 관련 문의", "technical"],
    ["파트너십 및 제휴 제안", "partnership"],
    ["기타", "general"],
  ] as const)("maps %s to %s", (type, expected) => {
    expect(templateKeyFromType(type)).toBe(expected);
  });

  it("falls back to general for an unknown type", () => {
    expect(templateKeyFromType("존재하지 않는 유형")).toBe("general");
  });
});
