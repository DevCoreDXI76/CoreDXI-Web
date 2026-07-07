"use server";

import { revalidatePath } from "next/cache";
import { savePageContent } from "@/lib/page-content";
import type { AboutContent } from "@/lib/page-content/about";

function validate(data: AboutContent): string | null {
  if (!data.heroTitleLine1.trim() || !data.heroTitleLine2.trim()) {
    return "히어로 타이틀을 입력해 주세요.";
  }
  if (!data.heroSubtitle.trim()) return "히어로 서브 문구를 입력해 주세요.";
  if (data.missionFeatures.some((f) => !f.title.trim() || !f.desc.trim())) {
    return "미션 특징 4개의 제목·설명을 모두 입력해 주세요.";
  }
  if (data.values.some((v) => !v.title.trim() || !v.desc.trim())) {
    return "핵심 가치 3개의 제목·설명을 모두 입력해 주세요.";
  }
  if (data.stats.some((s) => !s.value.trim() || !s.label.trim())) {
    return "신뢰 지표의 수치와 라벨을 모두 입력해 주세요.";
  }
  return null;
}

function normalize(data: AboutContent): AboutContent {
  return {
    heroBadge: data.heroBadge.trim(),
    heroTitleLine1: data.heroTitleLine1.trim(),
    heroTitleLine2: data.heroTitleLine2.trim(),
    heroSubtitle: data.heroSubtitle.trim(),
    missionLabel: data.missionLabel.trim(),
    missionTitleLine1: data.missionTitleLine1.trim(),
    missionTitleLine2: data.missionTitleLine2.trim(),
    missionParagraph1: data.missionParagraph1.trim(),
    missionParagraph2: data.missionParagraph2.trim(),
    missionFeatures: data.missionFeatures.map((f) => ({
      title: f.title.trim(),
      desc: f.desc.trim(),
    })),
    valuesLabel: data.valuesLabel.trim(),
    valuesTitle: data.valuesTitle.trim(),
    values: data.values.map((v) => ({ title: v.title.trim(), desc: v.desc.trim() })),
    stats: data.stats.map((s) => ({ value: s.value.trim(), label: s.label.trim() })),
    ctaTitle: data.ctaTitle.trim(),
    ctaDesc: data.ctaDesc.trim(),
  };
}

export async function saveAboutContent(
  data: AboutContent
): Promise<{ success: boolean; message: string }> {
  const error = validate(data);
  if (error) return { success: false, message: error };

  try {
    await savePageContent("about", normalize(data));
    revalidatePath("/about");
    revalidatePath("/admin/about");
    return { success: true, message: "회사소개 페이지가 저장되었습니다." };
  } catch (e) {
    console.error("[saveAboutContent]", e);
    return { success: false, message: "저장 중 오류가 발생했습니다." };
  }
}
