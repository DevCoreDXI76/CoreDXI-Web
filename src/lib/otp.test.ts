import { describe, expect, it } from "vitest";
import {
  generateOtpCode,
  getOtpExpiresAt,
  isValidEmail,
  normalizeEmail,
} from "./otp";

describe("normalizeEmail", () => {
  it("trims whitespace and lowercases", () => {
    expect(normalizeEmail("  User@Example.COM  ")).toBe("user@example.com");
  });
});

describe("isValidEmail", () => {
  it("accepts a plausible email", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
  });

  it("rejects a string without @", () => {
    expect(isValidEmail("userexample.com")).toBe(false);
  });

  it("rejects a string without a dot", () => {
    expect(isValidEmail("user@examplecom")).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(isValidEmail("")).toBe(false);
  });
});

describe("generateOtpCode", () => {
  it("returns a 6-digit zero-padded string", () => {
    for (let i = 0; i < 50; i++) {
      const code = generateOtpCode();
      expect(code).toMatch(/^\d{6}$/);
    }
  });
});

describe("getOtpExpiresAt", () => {
  it("returns a timestamp 5 minutes in the future", () => {
    const before = Date.now();
    const expiresAt = getOtpExpiresAt();
    const after = Date.now();

    expect(expiresAt.getTime()).toBeGreaterThanOrEqual(before + 5 * 60 * 1000);
    expect(expiresAt.getTime()).toBeLessThanOrEqual(after + 5 * 60 * 1000);
  });
});
