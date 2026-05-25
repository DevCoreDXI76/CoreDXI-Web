"use server";

import { auth } from "@/auth";
import { getContactNotificationEmail } from "@/actions/contact";
import { sendResendEmail } from "@/lib/resend";

const REPLY_EMAIL_FROM = "CoreDXI <contact@coredxi.com>";

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

  const replyTo = await getContactNotificationEmail();

  const result = await sendResendEmail({
    from: REPLY_EMAIL_FROM,
    to,
    subject,
    text,
    replyTo,
  });

  if (!result.success) {
    console.error("[sendReplyEmail]", result.error);
    return {
      success: false,
      error: result.error,
    };
  }

  return { success: true };
}
