-- AlterTable
ALTER TABLE "Portfolio" ADD COLUMN "industry" TEXT;
ALTER TABLE "Portfolio" ADD COLUMN "solutionType" TEXT;

-- CreateIndex
CREATE INDEX "Portfolio_industry_idx" ON "Portfolio"("industry");

-- CreateIndex
CREATE INDEX "Portfolio_solutionType_idx" ON "Portfolio"("solutionType");
