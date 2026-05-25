"use server";

import { auth } from "@/auth";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export type ContactRecord = {
  id: string;
  name: string;
  email: string;
  type: string;
  message: string;
  status: string;
  created_at: string;
};

export type ContactFormInput = {
  firstName: string;
  lastName: string;
  email: string;
  type: string;
  message: string;
};

export type ContactSubmitResult =
  | { success: true }
  | { success: false; error: string };

export type ContactListResult =
  | { success: true; data: ContactRecord[] }
  | { success: false; error: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function requireAdmin(): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (session?.user?.accountType !== "admin" || !session.user.role) {
    return { ok: false, error: "관리자 로그인이 필요합니다." };
  }
  return { ok: true };
}

export async function listContacts(): Promise<ContactListResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return { success: false, error: gate.error };

  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return {
      success: false,
      error: "문의 조회 설정이 완료되지 않았습니다.",
    };
  }

  try {
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[listContacts]", error);
      return {
        success: false,
        error: "문의 목록을 불러오는 중 오류가 발생했습니다.",
      };
    }

    return { success: true, data: (data ?? []) as ContactRecord[] };
  } catch (e) {
    console.error("[listContacts]", e);
    return {
      success: false,
      error: "문의 목록을 불러오는 중 오류가 발생했습니다.",
    };
  }
}

export async function submitContactForm(
  data: ContactFormInput
): Promise<ContactSubmitResult> {
  const firstName = data.firstName.trim();
  const lastName = data.lastName.trim();
  const email = data.email.trim();
  const type = data.type.trim();
  const message = data.message.trim();
  const name = [lastName, firstName].filter(Boolean).join(" ").trim();

  if (!name) {
    return { success: false, error: "이름을 입력해 주세요." };
  }
  if (!email || !EMAIL_PATTERN.test(email)) {
    return { success: false, error: "올바른 이메일 주소를 입력해 주세요." };
  }
  if (!type) {
    return { success: false, error: "문의 유형을 선택해 주세요." };
  }
  if (!message) {
    return { success: false, error: "문의 내용을 입력해 주세요." };
  }

  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return {
      success: false,
      error: "문의 저장 설정이 완료되지 않았습니다.",
    };
  }

  try {
    const { error } = await supabase.from("contacts").insert({
      name,
      email,
      type,
      message,
      status: "PENDING",
    });

    if (error) {
      console.error("[submitContactForm]", error);
      return {
        success: false,
        error: "문의 접수 중 오류가 발생했습니다.",
      };
    }

    return { success: true };
  } catch (e) {
    console.error("[submitContactForm]", e);
    return {
      success: false,
      error: "문의 접수 중 오류가 발생했습니다.",
    };
  }
}
