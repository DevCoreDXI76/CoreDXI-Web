import { beforeEach, describe, expect, it, vi } from "vitest";

const deleteMany = vi.fn();
const count = vi.fn();
const findFirst = vi.fn();
const create = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    rateLimitHit: {
      deleteMany: (...args: unknown[]) => deleteMany(...args),
      count: (...args: unknown[]) => count(...args),
      findFirst: (...args: unknown[]) => findFirst(...args),
      create: (...args: unknown[]) => create(...args),
    },
  },
}));

const { checkRateLimit, recordRateLimitHit } = await import("./rate-limit");

describe("checkRateLimit", () => {
  beforeEach(() => {
    deleteMany.mockReset().mockResolvedValue({ count: 0 });
    count.mockReset();
    findFirst.mockReset();
    create.mockReset().mockResolvedValue({});
  });

  it("allows the request and records a hit when under the limit", async () => {
    count.mockResolvedValue(2);

    const result = await checkRateLimit("test-key", { max: 5, windowMs: 60_000 });

    expect(result).toEqual({ allowed: true });
    expect(create).toHaveBeenCalledWith({ data: { key: "test-key" } });
  });

  it("denies the request once the limit is reached", async () => {
    count.mockResolvedValue(5);
    findFirst.mockResolvedValue({ createdAt: new Date(Date.now() - 10_000) });

    const result = await checkRateLimit("test-key", { max: 5, windowMs: 60_000 });

    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.retryAfterSeconds).toBeGreaterThan(0);
      expect(result.retryAfterSeconds).toBeLessThanOrEqual(60);
    }
    expect(create).not.toHaveBeenCalled();
  });

  it("cleans up hits older than the window before counting", async () => {
    count.mockResolvedValue(0);

    await checkRateLimit("test-key", { max: 5, windowMs: 60_000 });

    expect(deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ key: "test-key" }),
      })
    );
  });

  it("does not record a hit when allowed but recordOnAllowed is false", async () => {
    count.mockResolvedValue(2);

    const result = await checkRateLimit("test-key", {
      max: 5,
      windowMs: 60_000,
      recordOnAllowed: false,
    });

    expect(result).toEqual({ allowed: true });
    expect(create).not.toHaveBeenCalled();
  });
});

describe("recordRateLimitHit", () => {
  beforeEach(() => {
    create.mockReset().mockResolvedValue({});
  });

  it("records a hit for the given key", async () => {
    await recordRateLimitHit("test-key");

    expect(create).toHaveBeenCalledWith({ data: { key: "test-key" } });
  });
});
