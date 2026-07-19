import { beforeEach, describe, expect, it, vi } from "vitest";

const findUnique = vi.fn();
const deleteOtp = vi.fn();
vi.mock("@/lib/prisma", () => ({
  prisma: {
    otpCode: {
      findUnique: (...args: unknown[]) => findUnique(...args),
      delete: (...args: unknown[]) => deleteOtp(...args),
    },
  },
}));

const checkRateLimit = vi.fn();
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: (...args: unknown[]) => checkRateLimit(...args),
}));

const { POST } = await import("./route");

function request(body: unknown) {
  return new Request("http://localhost/api/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/verify-otp", () => {
  beforeEach(() => {
    findUnique.mockReset();
    deleteOtp.mockReset().mockResolvedValue({});
    checkRateLimit.mockReset().mockResolvedValue({ allowed: true });
  });

  it("rate-limits by normalized email before touching the DB", async () => {
    checkRateLimit.mockResolvedValue({ allowed: false, retryAfterSeconds: 42 });

    const res = await POST(request({ email: "  Foo@Bar.com  ", code: "123456" }));
    const body = await res.json();

    expect(checkRateLimit).toHaveBeenCalledWith("otp-verify:foo@bar.com", {
      max: 5,
      windowMs: 5 * 60 * 1000,
    });
    expect(res.status).toBe(429);
    expect(body.success).toBe(false);
    expect(body.message).toContain("42초");
    expect(findUnique).not.toHaveBeenCalled();
  });

  it("succeeds and deletes the OTP record when the code matches", async () => {
    findUnique.mockResolvedValue({
      email: "foo@bar.com",
      code: "123456",
      expiresAt: new Date(Date.now() + 60_000),
    });

    const res = await POST(request({ email: "foo@bar.com", code: "123456" }));
    const body = await res.json();

    expect(body.success).toBe(true);
    expect(deleteOtp).toHaveBeenCalledWith({ where: { email: "foo@bar.com" } });
  });

  it("fails without deleting the record when the code is wrong", async () => {
    findUnique.mockResolvedValue({
      email: "foo@bar.com",
      code: "123456",
      expiresAt: new Date(Date.now() + 60_000),
    });

    const res = await POST(request({ email: "foo@bar.com", code: "000000" }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(deleteOtp).not.toHaveBeenCalled();
  });
});
