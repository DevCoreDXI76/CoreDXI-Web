import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "블로그 — CoreDXI",
  description: "CoreDXI 소식·인사이트·고객 사례를 만나보세요.",
};

export default async function BlogIndexPage() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
    select: {
      slug: true,
      title: true,
      excerpt: true,
      category: true,
      publishedAt: true,
    },
  });

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              블로그
            </h1>
            <p className="mt-2 text-gray-600">
              회사 소식과 기술 인사이트를 공유합니다.
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center text-gray-500">
              아직 공개된 글이 없습니다.
            </div>
          ) : (
            <ul className="space-y-4">
              {posts.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/blog/${p.slug}`}
                    className="block rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <p className="text-xs font-medium text-[#1E4E8C]">
                      {p.category}
                    </p>
                    <h2 className="mt-1 text-xl font-semibold text-gray-900">
                      {p.title}
                    </h2>
                    {p.excerpt ? (
                      <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                        {p.excerpt}
                      </p>
                    ) : null}
                    {p.publishedAt ? (
                      <p className="mt-3 text-xs text-gray-400">
                        {p.publishedAt.toLocaleDateString("ko-KR")}
                      </p>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}
