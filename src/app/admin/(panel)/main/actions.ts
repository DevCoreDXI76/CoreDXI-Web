"use server";

import { revalidatePath } from "next/cache";
import { savePageContent } from "@/lib/page-content";
import type { HomeContent } from "@/lib/page-content/home";

function validate(data: HomeContent): string | null {
  if (!data.badge.trim()) return "뱃지 문구를 입력해 주세요.";
  if (!data.title.trim()) return "메인 타이틀을 입력해 주세요.";
  if (!data.subtitle.trim()) return "서브 타이틀을 입력해 주세요.";
  if (!data.primaryCtaText.trim() || !data.primaryCtaHref.trim()) {
    return "주요 버튼 텍스트와 링크를 입력해 주세요.";
  }
  if (!data.secondaryCtaText.trim() || !data.secondaryCtaHref.trim()) {
    return "보조 버튼 텍스트와 링크를 입력해 주세요.";
  }
  if (data.stats.some((s) => !s.value.trim() || !s.label.trim())) {
    return "신뢰 지표의 수치와 라벨을 모두 입력해 주세요.";
  }
  return null;
}

function normalize(data: HomeContent): HomeContent {
  return {
    badge: data.badge.trim(),
    title: data.title.trim(),
    subtitle: data.subtitle.trim(),
    primaryCtaText: data.primaryCtaText.trim(),
    primaryCtaHref: data.primaryCtaHref.trim(),
    secondaryCtaText: data.secondaryCtaText.trim(),
    secondaryCtaHref: data.secondaryCtaHref.trim(),
    imageSrc: data.imageSrc?.trim() || null,
    imageAlt: data.imageAlt.trim(),
    stats: data.stats.map((s) => ({ value: s.value.trim(), label: s.label.trim() })),
  };
}

export async function saveHomeContent(
  data: HomeContent
): Promise<{ success: boolean; message: string }> {
  const error = validate(data);
  if (error) return { success: false, message: error };

  try {
    await savePageContent("home", normalize(data));
    revalidatePath("/");
    revalidatePath("/admin/main");
    return { success: true, message: "메인 화면이 저장되었습니다." };
  } catch (e) {
    console.error("[saveHomeContent]", e);
    return { success: false, message: "저장 중 오류가 발생했습니다." };
  }
}
