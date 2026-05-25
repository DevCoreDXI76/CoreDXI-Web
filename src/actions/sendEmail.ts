"use server";

import { auth } from "@/auth";
import { Resend } from "resend";

export type SendReplyEmailInput = {
  to: string;
  subject: string;
  text: string;
};

export type SendReplyEmailResult =
  | { success: true }
  | { success: false; error: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function requireAdmin(): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (session?.user?.accountType !== "admin" || !session.user.role) {
    return { ok: false, error: "관리자 로그인이 필요합니다." };
  }
  return { ok: true };
}

export async function sendReplyEmail(
  data: SendReplyEmailInput
): Promise<SendReplyEmailResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return { success: false, error: gate.error };

  const to = data.to?.trim() ?? "";
  const subject = data.subject?.trim() ?? "";
  const text = data.text?.trim() ?? "";

  if (!to || !EMAIL_PATTERN.test(to)) {
    return { success: false, error: "유효한 수신 이메일을 입력해 주세요." };
  }
  if (!subject) {
    return { success: false, error: "메일 제목을 입력해 주세요." };
  }
  if (!text) {
    return { success: false, error: "메일 본문 내용을 입력해 주세요." };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      error: "이메일 발송 설정이 완료되지 않았습니다.",
    };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to,
      subject,
      text,
    });

    if (error) {
      console.error("[sendReplyEmail]", error);
      return {
        success: false,
        error: "메일 발송에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      };
    }

    return { success: true };
  } catch (e) {
    console.error("[sendReplyEmail]", e);
    return {
      success: false,
      error: "메일 발송 중 오류가 발생했습니다.",
    };
  }
}
