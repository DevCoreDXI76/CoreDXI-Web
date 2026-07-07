import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PortfolioForm } from "../../portfolio-form";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminPortfolioEditPage({ params }: PageProps) {
  const { id } = await params;

  const item = await prisma.portfolio.findUnique({
    where: { id },
  });

  if (!item) notFound();

  return (
    <div className="px-6 py-10">
      <PortfolioForm
        mode="edit"
        initial={{
          id: item.id,
          title: item.title,
          clientName: item.clientName,
          thumbnailUrl: item.thumbnailUrl,
          videoUrl: item.videoUrl ?? "",
          content: item.content,
          metrics: item.metrics,
          industry: item.industry ?? "",
          solutionType: item.solutionType ?? "",
        }}
      />
    </div>
  );
}
