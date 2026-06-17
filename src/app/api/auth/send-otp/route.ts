import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendResendEmail } from "@/lib/resend";
import {
  generateOtpCode,
  getOtpExpiresAt,
  isValidEmail,
  normalizeEmail,
} from "@/lib/otp";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawEmail = typeof body.email === "string" ? body.email : "";
    const email = normalizeEmail(rawEmail);

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: "유효한 이메일을 입력해 주세요." },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("[send-otp] RESEND_API_KEY is not set");
      return NextResponse.json(
        { success: false, message: "이메일 발송 설정이 되어 있지 않습니다." },
        { status: 500 }
      );
    }

    const [existingUser, existingAdmin] = await Promise.all([
      prisma.user.findUnique({ where: { email } }),
      prisma.admin.findUnique({ where: { email } }),
    ]);

    if (existingUser || existingAdmin) {
      return NextResponse.json(
        { success: false, message: "이미 사용 중인 이메일입니다." },
        { status: 409 }
      );
    }

    const existingOtp = await prisma.otpCode.findFirst({ where: { email } });
    if (existingOtp) {
      const secondsElapsed = (Date.now() - existingOtp.createdAt.getTime()) / 1000;
      const cooldownSeconds = 60;
      if (secondsElapsed < cooldownSeconds) {
        const remaining = Math.ceil(cooldownSeconds - secondsElapsed);
        return NextResponse.json(
          { success: false, message: `인증 코드 재발송은 ${remaining}초 후에 가능합니다.` },
          { status: 429 }
        );
      }
    }

    const code = generateOtpCode();
    const expiresAt = getOtpExpiresAt();

    await prisma.otpCode.deleteMany({ where: { email } });
    await prisma.otpCode.create({
      data: { email, code, expiresAt },
    });

    const sendResult = await sendResendEmail({
      to: email,
      subject: "[CoreDXI] 회원가입 인증 코드입니다.",
      html: `인증 코드 6자리: <strong>${code}</strong><br/>이 코드는 5분간 유효합니다.`,
    });

    if (!sendResult.success) {
      console.error("[send-otp] Resend error:", sendResult.error);
      return NextResponse.json(
        { success: false, message: "인증 메일 발송에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[send-otp]", e);
    return NextResponse.json(
      { success: false, message: "인증 메일 발송 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
