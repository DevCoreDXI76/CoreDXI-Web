import Image from "next/image";
import Link from "next/link";
import type { PortfolioPublic } from "@/lib/portfolio";

type CaseCardProps = {
  item: Pick<
    PortfolioPublic,
    "id" | "slug" | "title" | "clientName" | "thumbnailUrl" | "metrics"
  >;
};

export function CaseCard({ item }: CaseCardProps) {
  return (
    <Link
      href={`/cases/${item.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <Image
          src={item.thumbnailUrl}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <span className="inline-flex w-fit rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
          {item.metrics}
        </span>
        <h2 className="text-lg font-semibold text-foreground group-hover:text-primary dark:group-hover:text-blue-300">
          {item.title}
        </h2>
        <p className="text-sm text-muted-foreground">{item.clientName}</p>
      </div>
    </Link>
  );
}
