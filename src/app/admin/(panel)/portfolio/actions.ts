"use server";

/**
 * [홍보팀/개발팀] 성공사례(Portfolio) 저장 시 DB에 기록되는 항목입니다.
 * - title: 성공사례 제목
 * - clientName: 고객사명
 * - thumbnailUrl: 썸네일 이미지 주소(URL)
 * - videoUrl: 유튜브·비메오 동영상 주소 (선택)
 * - content: 상세 설명 본문
 * - metrics: 성과 수치 (예: "업무 효율 30% 증대")
 * - industry: 업종 (선택, /cases 필터에 사용)
 * - solutionType: 솔루션 유형 (선택, /cases 필터에 사용)
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { uniquePortfolioSlug } from "@/lib/portfolio-slug";

export type PortfolioFormData = {
  title: string;
  clientName: string;
  thumbnailUrl: string;
  videoUrl: string;
  content: string;
  metrics: string;
  industry: string;
  solutionType: string;
};

function validate(data: PortfolioFormData): string | null {
  if (!data.title.trim()) return "제목을 입력해 주세요.";
  if (!data.clientName.trim()) return "고객사명을 입력해 주세요.";
  if (!data.thumbnailUrl.trim()) return "썸네일 이미지 URL을 입력해 주세요.";
  if (!data.metrics.trim()) return "성과 수치를 입력해 주세요.";
  if (!data.content.trim()) return "상세 내용을 입력해 주세요.";
  return null;
}

function normalize(data: PortfolioFormData) {
  return {
    title: data.title.trim(),
    clientName: data.clientName.trim(),
    thumbnailUrl: data.thumbnailUrl.trim(),
    videoUrl: data.videoUrl.trim() || null,
    content: data.content.trim(),
    metrics: data.metrics.trim(),
    industry: data.industry.trim() || null,
    solutionType: data.solutionType.trim() || null,
  };
}

function revalidatePublicPortfolio(slug?: string) {
  revalidatePath("/cases");
  revalidatePath("/");
  if (slug) revalidatePath(`/cases/${slug}`);
}

async function resolvePortfolioSlug(title: string): Promise<string> {
  return uniquePortfolioSlug(title, async (candidate) => {
    const existing = await prisma.portfolio.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    return Boolean(existing);
  });
}

export async function createPortfolio(
  data: PortfolioFormData
): Promise<{ success: boolean; message: string; id?: string }> {
  const error = validate(data);
  if (error) return { success: false, message: error };

  try {
    const slug = await resolvePortfolioSlug(data.title);
    const created = await prisma.portfolio.create({
      data: { ...normalize(data), slug },
    });
    revalidatePath("/admin/portfolio");
    revalidatePublicPortfolio(created.slug);
    return { success: true, message: "성공사례가 등록되었습니다.", id: created.id };
  } catch (e) {
    console.error("[createPortfolio]", e);
    return { success: false, message: "저장 중 오류가 발생했습니다." };
  }
}

export async function updatePortfolio(
  id: string,
  data: PortfolioFormData
): Promise<{ success: boolean; message: string }> {
  const error = validate(data);
  if (error) return { success: false, message: error };

  try {
    const existing = await prisma.portfolio.findUnique({
      where: { id },
      select: { slug: true },
    });
    if (!existing) {
      return { success: false, message: "성공사례를 찾을 수 없습니다." };
    }

    await prisma.portfolio.update({
      where: { id },
      data: normalize(data),
    });
    revalidatePath("/admin/portfolio");
    revalidatePath(`/admin/portfolio/${id}/edit`);
    revalidatePublicPortfolio(existing.slug);
    return { success: true, message: "성공사례가 수정되었습니다." };
  } catch (e) {
    console.error("[updatePortfolio]", e);
    return { success: false, message: "수정 중 오류가 발생했습니다." };
  }
}

export async function deletePortfolio(
  id: string
): Promise<{ success: boolean; message: string }> {
  try {
    const existing = await prisma.portfolio.findUnique({
      where: { id },
      select: { slug: true },
    });
    await prisma.portfolio.delete({ where: { id } });
    revalidatePath("/admin/portfolio");
    if (existing) revalidatePublicPortfolio(existing.slug);
    return { success: true, message: "성공사례가 삭제되었습니다." };
  } catch (e) {
    console.error("[deletePortfolio]", e);
    return { success: false, message: "삭제 중 오류가 발생했습니다." };
  }
}
