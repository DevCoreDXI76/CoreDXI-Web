import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidEmail, normalizeEmail } from "@/lib/otp";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawEmail = typeof body.email === "string" ? body.email : "";
    const email = normalizeEmail(rawEmail);
    const code =
      typeof body.code === "string"
        ? body.code.replace(/\D/g, "")
        : "";

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: "유효한 이메일을 입력해 주세요." },
        { status: 400 }
      );
    }

    if (code.length !== 6) {
      return NextResponse.json(
        { success: false, message: "6자리 인증 코드를 입력해 주세요." },
        { status: 400 }
      );
    }

    const rateLimit = await checkRateLimit(`otp-verify:${email}`, {
      max: 5,
      windowMs: 5 * 60 * 1000,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `너무 많이 시도했습니다. ${rateLimit.retryAfterSeconds}초 후 다시 시도해 주세요.`,
        },
        { status: 429 }
      );
    }

    const record = await prisma.otpCode.findUnique({ where: { email } });

    if (!record) {
      return NextResponse.json(
        {
          success: false,
          message: "인증 코드가 없습니다. 다시 발송해 주세요.",
        },
        { status: 400 }
      );
    }

    if (record.expiresAt < new Date()) {
      await prisma.otpCode.delete({ where: { email } });
      return NextResponse.json(
        {
          success: false,
          message: "인증 코드가 만료되었습니다. 다시 발송해 주세요.",
        },
        { status: 400 }
      );
    }

    if (record.code !== code) {
      return NextResponse.json(
        { success: false, message: "인증 코드가 올바르지 않습니다." },
        { status: 400 }
      );
    }

    await prisma.otpCode.delete({ where: { email } });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[verify-otp]", e);
    return NextResponse.json(
      { success: false, message: "인증 확인 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
