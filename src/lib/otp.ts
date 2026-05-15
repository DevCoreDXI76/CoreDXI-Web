import { randomInt } from "crypto";

const OTP_TTL_MS = 5 * 60 * 1000;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return email.includes("@") && email.includes(".");
}

export function generateOtpCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function getOtpExpiresAt(): Date {
  return new Date(Date.now() + OTP_TTL_MS);
}
