/**
 * 기존 Portfolio 행의 slug를 제목 기반 SEO 친화 URL로 일괄 갱신합니다.
 * 실행: npx tsx scripts/backfill-portfolio-slugs.ts
 */
import { config } from "dotenv";

config({ path: ".env" });

async function main() {
  const { prisma } = await import("../src/lib/prisma");
  const { uniquePortfolioSlug } = await import("../src/lib/portfolio-slug");

  const items = await prisma.portfolio.findMany({
    select: { id: true, title: true, slug: true },
    orderBy: { createdAt: "asc" },
  });

  let updated = 0;
  for (const item of items) {
    const slug = await uniquePortfolioSlug(item.title, async (candidate) => {
      const existing = await prisma.portfolio.findFirst({
        where: { slug: candidate, NOT: { id: item.id } },
        select: { id: true },
      });
      return Boolean(existing);
    });

    if (slug !== item.slug) {
      await prisma.portfolio.update({
        where: { id: item.id },
        data: { slug },
      });
      updated += 1;
      console.log(`  ${item.id} -> ${slug}`);
    }
  }

  console.log(`완료: ${updated}/${items.length}건 slug 갱신`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
