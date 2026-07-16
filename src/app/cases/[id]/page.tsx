import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { getPortfolioById } from "@/lib/portfolio";
import { buildBreadcrumbJsonLd } from "@/lib/seo-jsonld";
import { siteUrl } from "@/lib/seo";
import { getVideoEmbedUrl } from "@/lib/video-embed";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const item = await getPortfolioById(id);
  if (!item) return { title: "성공사례" };

  const description = `${item.clientName} · ${item.metrics}`;
  const canonical = siteUrl(`/cases/${id}`);

  return {
    title: item.title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      locale: "ko_KR",
      siteName: "CoreDXI",
      title: item.title,
      description,
      url: canonical,
      images: item.thumbnailUrl ? [{ url: item.thumbnailUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: item.title,
      description,
      images: item.thumbnailUrl ? [item.thumbnailUrl] : undefined,
    },
  };
}

export default async function CaseDetailPage({ params }: PageProps) {
  const { id } = await params;
  const item = await getPortfolioById(id);
  if (!item) notFound();

  const embedUrl = item.videoUrl ? getVideoEmbedUrl(item.videoUrl) : null;
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "성공사례", path: "/cases" },
    { name: item.title, path: `/cases/${id}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
      <Header />
      <main className="min-h-screen bg-gray-50 pt-24 pb-16">
        <article className="mx-auto max-w-3xl px-6">
          <Link
            href="/cases"
            className="mb-6 inline-flex text-sm font-medium text-[#1E4E8C] hover:underline"
          >
            ← 목록으로
          </Link>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="relative aspect-[16/9] bg-gray-100">
              <Image
                src={item.thumbnailUrl}
                alt={item.title}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 768px, 100vw"
                priority
              />
            </div>

            <div className="space-y-6 p-6 md:p-8">
              <div>
                <span className="inline-flex rounded-full bg-[#1E4E8C]/10 px-3 py-1 text-sm font-medium text-[#1E4E8C]">
                  {item.metrics}
                </span>
                <h1 className="mt-3 text-2xl font-bold text-gray-900 md:text-3xl">
                  {item.title}
                </h1>
                <p className="mt-1 text-gray-500">{item.clientName}</p>
              </div>

              {embedUrl ? (
                <div className="aspect-video overflow-hidden rounded-lg bg-black">
                  <iframe
                    src={embedUrl}
                    title={`${item.title} 동영상`}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : item.videoUrl ? (
                <a
                  href={item.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex text-sm font-medium text-[#1E4E8C] hover:underline"
                >
                  동영상 보기 →
                </a>
              ) : null}

              <div className="whitespace-pre-wrap leading-relaxed text-gray-700">
                {item.content}
              </div>
            </div>
          </div>
        </article>
      </main>
    </>
  );
}
