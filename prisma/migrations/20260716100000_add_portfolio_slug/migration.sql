-- Portfolio SEO용 slug 컬럼 추가 (기존 행은 id 기반 임시 slug, 앱 배포 후 backfill 스크립트로 제목 기반 slug 갱신)
ALTER TABLE "Portfolio" ADD COLUMN "slug" TEXT;

UPDATE "Portfolio"
SET "slug" = 'case-' || substring("id" from 1 for 12)
WHERE "slug" IS NULL;

ALTER TABLE "Portfolio" ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX "Portfolio_slug_key" ON "Portfolio"("slug");
