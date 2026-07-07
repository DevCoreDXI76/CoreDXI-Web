import { prisma } from "@/lib/prisma";

/**
 * 홈/소개/솔루션 등 정적 페이지 콘텐츠 — PageContent 테이블에 저장된 값이
 * 있으면 그 값을, 없으면(첫 배포 직후 등) defaults를 사용한다.
 */
export async function getPageContent<T extends object>(
  page: string,
  defaults: T
): Promise<T> {
  const row = await prisma.pageContent.findUnique({ where: { page } });
  if (!row) return defaults;
  return { ...defaults, ...(row.content as Partial<T>) };
}

export async function savePageContent<T>(
  page: string,
  content: T
): Promise<void> {
  await prisma.pageContent.upsert({
    where: { page },
    create: { page, content: content as never },
    update: { content: content as never },
  });
}
