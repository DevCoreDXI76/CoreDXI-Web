-- CreateTable Admin
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'VIEWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- Migrate existing admins from User (SUPER_ADMIN / EDITOR with password)
INSERT INTO "Admin" ("id", "email", "name", "password", "role", "createdAt", "updatedAt")
SELECT "id", "email", "name", "password", "role", "createdAt", "updatedAt"
FROM "User"
WHERE "password" IS NOT NULL
  AND "role" IN ('SUPER_ADMIN', 'EDITOR');

-- Admin으로 이전한 계정은 User 쪽 비밀번호 제거 (고객 로그인과 분리)
UPDATE "User"
SET "password" = NULL
WHERE "id" IN (SELECT "id" FROM "Admin");

-- Drop role from User (general customers only)
ALTER TABLE "User" DROP COLUMN "role";
