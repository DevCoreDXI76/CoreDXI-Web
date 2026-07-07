import { prisma } from "@/lib/prisma";

export type PortfolioPublic = {
  id: string;
  title: string;
  clientName: string;
  thumbnailUrl: string;
  videoUrl: string | null;
  content: string;
  metrics: string;
  industry: string | null;
  solutionType: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const portfolioSelect = {
  id: true,
  title: true,
  clientName: true,
  thumbnailUrl: true,
  videoUrl: true,
  content: true,
  metrics: true,
  industry: true,
  solutionType: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type PortfolioFilter = {
  industry?: string;
  solutionType?: string;
};

export async function getPortfolios(
  filter?: PortfolioFilter
): Promise<PortfolioPublic[]> {
  return prisma.portfolio.findMany({
    where: {
      ...(filter?.industry ? { industry: filter.industry } : {}),
      ...(filter?.solutionType ? { solutionType: filter.solutionType } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: portfolioSelect,
  });
}

export async function getPortfolioById(
  id: string
): Promise<PortfolioPublic | null> {
  return prisma.portfolio.findUnique({
    where: { id },
    select: portfolioSelect,
  });
}
