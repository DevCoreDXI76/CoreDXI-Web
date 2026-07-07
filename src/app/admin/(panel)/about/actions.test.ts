import { beforeEach, describe, expect, it, vi } from "vitest";
import { ABOUT_CONTENT_DEFAULTS } from "@/lib/page-content/about";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const savePageContentMock = vi.fn().mockResolvedValue(undefined);
vi.mock("@/lib/page-content", () => ({
  savePageContent: (...args: unknown[]) => savePageContentMock(...args),
}));

const { saveAboutContent } = await import("./actions");

describe("saveAboutContent", () => {
  beforeEach(() => {
    savePageContentMock.mockClear();
  });

  it("rejects when a mission feature is incomplete", async () => {
    const result = await saveAboutContent({
      ...ABOUT_CONTENT_DEFAULTS,
      missionFeatures: [
        { title: "", desc: "설명" },
        ...ABOUT_CONTENT_DEFAULTS.missionFeatures.slice(1),
      ],
    });
    expect(result.success).toBe(false);
    expect(savePageContentMock).not.toHaveBeenCalled();
  });

  it("rejects when a core value is incomplete", async () => {
    const result = await saveAboutContent({
      ...ABOUT_CONTENT_DEFAULTS,
      values: [
        { title: "단순함", desc: "" },
        ...ABOUT_CONTENT_DEFAULTS.values.slice(1),
      ],
    });
    expect(result.success).toBe(false);
  });

  it("saves normalized content on valid input", async () => {
    const result = await saveAboutContent({
      ...ABOUT_CONTENT_DEFAULTS,
      heroBadge: "  회사 소개  ",
    });
    expect(result.success).toBe(true);
    expect(savePageContentMock).toHaveBeenCalledWith(
      "about",
      expect.objectContaining({ heroBadge: "회사 소개" })
    );
  });
});
