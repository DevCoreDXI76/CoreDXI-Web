import { beforeEach, describe, expect, it, vi } from "vitest";

const checkRateLimit = vi.fn();
const recordRateLimitHit = vi.fn();
const getClientIp = vi.fn();

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: (...args: unknown[]) => checkRateLimit(...args),
  recordRateLimitHit: (...args: unknown[]) => recordRateLimitHit(...args),
}));

vi.mock("@/lib/client-ip", () => ({
  getClientIp: (...args: unknown[]) => getClientIp(...args),
}));

const { checkUserLoginRateLimit } = await import("./user-login-rate-limit");

const WINDOW_MS = 15 * 60 * 1000;

describe("checkUserLoginRateLimit", () => {
  beforeEach(() => {
    checkRateLimit.mockReset();
    recordRateLimitHit.mockReset().mockResolvedValue(undefined);
    getClientIp.mockReset().mockResolvedValue("1.2.3.4");
  });

  it("returns allowed with recordFailure when both email and IP checks pass, using exact keys/limits", async () => {
    checkRateLimit.mockResolvedValue({ allowed: true });

    const result = await checkUserLoginRateLimit("foo@bar.com");

    expect(result.allowed).toBe(true);
    if (result.allowed) {
      expect(typeof result.recordFailure).toBe("function");
    }

    expect(checkRateLimit).toHaveBeenNthCalledWith(1, "user-login:foo@bar.com", {
      max: 5,
      windowMs: WINDOW_MS,
      recordOnAllowed: false,
    });
    expect(checkRateLimit).toHaveBeenNthCalledWith(2, "user-login-ip:1.2.3.4", {
      max: 20,
      windowMs: WINDOW_MS,
      recordOnAllowed: false,
    });
    expect(checkRateLimit).toHaveBeenCalledTimes(2);
  });

  it("normalizes the email into the key (trims whitespace, lowercases)", async () => {
    checkRateLimit.mockResolvedValue({ allowed: true });

    await checkUserLoginRateLimit("  Foo@Bar.com  ");

    expect(checkRateLimit).toHaveBeenNthCalledWith(
      1,
      "user-login:foo@bar.com",
      expect.objectContaining({ max: 5, windowMs: WINDOW_MS, recordOnAllowed: false })
    );
  });

  it("returns not allowed when the email-key check fails, short-circuiting before the IP check", async () => {
    checkRateLimit.mockResolvedValueOnce({ allowed: false, retryAfterSeconds: 60 });

    const result = await checkUserLoginRateLimit("foo@bar.com");

    expect(result).toEqual({ allowed: false });
    expect(checkRateLimit).toHaveBeenCalledTimes(1);
    expect(checkRateLimit).not.toHaveBeenCalledWith(
      "user-login-ip:1.2.3.4",
      expect.anything()
    );
  });

  it("returns not allowed when the IP-key check fails (email check allowed)", async () => {
    checkRateLimit
      .mockResolvedValueOnce({ allowed: true })
      .mockResolvedValueOnce({ allowed: false, retryAfterSeconds: 60 });

    const result = await checkUserLoginRateLimit("foo@bar.com");

    expect(result).toEqual({ allowed: false });
    expect(checkRateLimit).toHaveBeenCalledTimes(2);
  });

  it("calling recordFailure() records a hit for both the email key and the IP key exactly once each", async () => {
    checkRateLimit.mockResolvedValue({ allowed: true });

    const result = await checkUserLoginRateLimit("foo@bar.com");
    expect(result.allowed).toBe(true);
    if (!result.allowed) throw new Error("expected allowed result");

    await result.recordFailure();

    expect(recordRateLimitHit).toHaveBeenCalledTimes(2);
    expect(recordRateLimitHit).toHaveBeenCalledWith("user-login:foo@bar.com");
    expect(recordRateLimitHit).toHaveBeenCalledWith("user-login-ip:1.2.3.4");
  });

  it("does not record any hit when recordFailure() is never called (successful login path)", async () => {
    checkRateLimit.mockResolvedValue({ allowed: true });

    const result = await checkUserLoginRateLimit("foo@bar.com");
    expect(result.allowed).toBe(true);

    // Simulate a successful login: recordFailure() is intentionally not invoked.
    expect(recordRateLimitHit).not.toHaveBeenCalled();
  });
});
