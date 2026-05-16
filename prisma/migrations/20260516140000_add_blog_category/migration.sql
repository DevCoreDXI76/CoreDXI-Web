-- CreateTable
CREATE TABLE "BlogCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogCategory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BlogCategory_slug_key" ON "BlogCategory"("slug");

-- Seed default topics (matches former BLOG_CATEGORIES)
INSERT INTO "BlogCategory" ("id", "name", "slug", "description", "sortOrder", "updatedAt") VALUES
  ('blogcat_company', '회사 소식', 'company-news', 'CoreDXI의 소식과 공지를 전합니다.', 0, CURRENT_TIMESTAMP),
  ('blogcat_tech', '기술·인사이트', 'tech-insight', '기술 트렌드와 인사이트를 공유합니다.', 1, CURRENT_TIMESTAMP),
  ('blogcat_cases', '고객 사례', 'customer-stories', '고객 성공 사례를 소개합니다.', 2, CURRENT_TIMESTAMP),
  ('blogcat_media', '미디어', 'media', '언론·미디어 관련 소식입니다.', 3, CURRENT_TIMESTAMP),
  ('blogcat_misc', '기타', 'misc', '기타 블로그 글입니다.', 4, CURRENT_TIMESTAMP);

-- Add categoryId (nullable during backfill)
ALTER TABLE "BlogPost" ADD COLUMN "categoryId" TEXT;

-- Map legacy category strings to BlogCategory
UPDATE "BlogPost" SET "categoryId" = 'blogcat_company' WHERE "category" = '회사 소식';
UPDATE "BlogPost" SET "categoryId" = 'blogcat_tech' WHERE "category" = '기술·인사이트';
UPDATE "BlogPost" SET "categoryId" = 'blogcat_cases' WHERE "category" = '고객 사례';
UPDATE "BlogPost" SET "categoryId" = 'blogcat_media' WHERE "category" = '미디어';
UPDATE "BlogPost" SET "categoryId" = 'blogcat_misc' WHERE "category" = '기타';

-- Legacy category labels not in seed list
DO $$
DECLARE
  r RECORD;
  new_id TEXT;
  new_slug TEXT;
BEGIN
  FOR r IN SELECT DISTINCT "category" FROM "BlogPost" WHERE "categoryId" IS NULL
  LOOP
    new_id := 'blogcat_legacy_' || substr(md5(r."category"), 1, 12);
    new_slug := 'legacy-' || substr(md5(r."category"), 1, 12);
    INSERT INTO "BlogCategory" ("id", "name", "slug", "description", "sortOrder", "updatedAt")
    VALUES (new_id, r."category", new_slug, NULL, 100, CURRENT_TIMESTAMP)
    ON CONFLICT ("slug") DO NOTHING;
    UPDATE "BlogPost" SET "categoryId" = new_id WHERE "category" = r."category" AND "categoryId" IS NULL;
  END LOOP;
END $$;

-- Fallback to misc
UPDATE "BlogPost" SET "categoryId" = 'blogcat_misc' WHERE "categoryId" IS NULL;

ALTER TABLE "BlogPost" ALTER COLUMN "categoryId" SET NOT NULL;

ALTER TABLE "BlogPost" DROP COLUMN "category";

CREATE INDEX "BlogPost_categoryId_idx" ON "BlogPost"("categoryId");

ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BlogCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
