import { prisma } from "@/lib/prisma";

export type PortfolioPublic = {
  id: string;
  title: string;
  clientName: string;
  thumbnailUrl: string;
  videoUrl: string | null;
  content: string;
  metrics: string;
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
  createdAt: true,
  updatedAt: true,
} as const;

export async function getPortfolios(): Promise<PortfolioPublic[]> {
  return prisma.portfolio.findMany({
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
