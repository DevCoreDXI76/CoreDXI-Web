import { beforeEach, describe, expect, it, vi } from "vitest";
import { HOME_CONTENT_DEFAULTS } from "@/lib/page-content/home";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const savePageContentMock = vi.fn().mockResolvedValue(undefined);
vi.mock("@/lib/page-content", () => ({
  savePageContent: (...args: unknown[]) => savePageContentMock(...args),
}));

const { saveHomeContent } = await import("./actions");

describe("saveHomeContent", () => {
  beforeEach(() => {
    savePageContentMock.mockClear();
  });

  it("rejects a blank title", async () => {
    const result = await saveHomeContent({ ...HOME_CONTENT_DEFAULTS, title: "  " });
    expect(result.success).toBe(false);
    expect(savePageContentMock).not.toHaveBeenCalled();
  });

  it("rejects incomplete stats", async () => {
    const result = await saveHomeContent({
      ...HOME_CONTENT_DEFAULTS,
      stats: [{ value: "", label: "고객" }, ...HOME_CONTENT_DEFAULTS.stats.slice(1)],
    });
    expect(result.success).toBe(false);
  });

  it("trims fields and saves on valid input", async () => {
    const result = await saveHomeContent({
      ...HOME_CONTENT_DEFAULTS,
      badge: "  뱃지  ",
    });
    expect(result.success).toBe(true);
    expect(savePageContentMock).toHaveBeenCalledWith(
      "home",
      expect.objectContaining({ badge: "뱃지" })
    );
  });

  it("normalizes a blank imageSrc to null", async () => {
    await saveHomeContent({ ...HOME_CONTENT_DEFAULTS, imageSrc: "   " });
    expect(savePageContentMock).toHaveBeenCalledWith(
      "home",
      expect.objectContaining({ imageSrc: null })
    );
  });
});
