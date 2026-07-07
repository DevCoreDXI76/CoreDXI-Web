import { beforeEach, describe, expect, it, vi } from "vitest";

const findUnique = vi.fn();
const upsert = vi.fn();
vi.mock("@/lib/prisma", () => ({
  prisma: { pageContent: { findUnique: (...a: unknown[]) => findUnique(...a), upsert: (...a: unknown[]) => upsert(...a) } },
}));

const { getPageContent, savePageContent } = await import("./page-content");

const defaults = { title: "기본 제목", stats: [{ value: "1", label: "a" }] };

describe("getPageContent", () => {
  beforeEach(() => {
    findUnique.mockReset();
  });

  it("returns defaults when no row exists", async () => {
    findUnique.mockResolvedValue(null);
    const result = await getPageContent("home", defaults);
    expect(result).toEqual(defaults);
  });

  it("merges stored content over defaults", async () => {
    findUnique.mockResolvedValue({
      content: { title: "저장된 제목" },
    });
    const result = await getPageContent("home", defaults);
    expect(result).toEqual({ title: "저장된 제목", stats: defaults.stats });
  });

  it("fully replaces array fields present in stored content", async () => {
    findUnique.mockResolvedValue({
      content: { stats: [{ value: "2", label: "b" }] },
    });
    const result = await getPageContent("home", defaults);
    expect(result.stats).toEqual([{ value: "2", label: "b" }]);
  });
});

describe("savePageContent", () => {
  it("upserts by page", async () => {
    upsert.mockResolvedValue({});
    await savePageContent("home", defaults);
    expect(upsert).toHaveBeenCalledWith({
      where: { page: "home" },
      create: { page: "home", content: defaults },
      update: { content: defaults },
    });
  });
});
