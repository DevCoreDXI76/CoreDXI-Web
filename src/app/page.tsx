import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, Tag as TagIcon } from "lucide-react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { CasesPreview } from "@/components/CasesPreview";
import { Footer } from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import {
  mapBlogPostToListCard,
  type BlogListCard,
} from "@/components/blog/types";
import { formatKstDateLong } from "@/lib/format-kst-date";

export const dynamic = "force-dynamic";

async function getHomeBlogPosts(): Promise<BlogListCard[]> {
  try {
    const rows = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
      take: 5,
      select: {
        slug: true,
        title: true,
        excerpt: true,
        coverImageUrl: true,
        publishedAt: true,
        updatedAt: true,
        category: { select: { name: true, slug: true } },
      },
    });
    return rows.map(mapBlogPostToListCard);
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const posts = await getHomeBlogPosts();
  const featured = posts[0];
  const latest = posts.slice(1);

  return (
    <>
      <Header />

      <main className="bg-background">
        {/* ── 히어로 ───────────────────────────────────────── */}
        <Hero />

        {/* ── 성공사례 미리보기 ─────────────────────────────── */}
        <CasesPreview />

        {/* ── 블로그 섹션 ──────────────────────────────────── */}
        {posts.length > 0 && (
          <section className="bg-slate-50 py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {/* 섹션 헤더 */}
              <div className="mb-8 flex items-end justify-between gap-6">
                <div className="space-y-2">
                  <p className="text-sm font-semibold tracking-tight text-primary">
                    오늘의 주요 기술 인사이트
                  </p>
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                    최신 업데이트와 실전 인사이트를 매거진처럼.
                  </h2>
                  <p className="max-w-2xl text-base leading-relaxed text-slate-600">
                    CoreDXI의 제품 개발 과정에서 얻은 지식과 시행착오를 공개합니다.
                  </p>
                </div>
                <Link
                  href="/blog"
                  className="hidden shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md md:inline-flex"
                  aria-label="기술 블로그로 이동"
                >
                  기술 블로그
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              {/* 피처드 포스트 */}
              {featured && (
                <article className="group mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="grid grid-cols-1 lg:grid-cols-5">
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 lg:aspect-auto lg:col-span-3 lg:min-h-[360px]">
                      <Image
                        src={featured.coverImageUrl}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        sizes="(min-width: 1024px) 60vw, 100vw"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-slate-900/0 to-transparent" />
                    </div>

                    <div className="flex flex-col gap-5 p-6 lg:col-span-2 lg:p-8">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
                          <TagIcon className="h-3.5 w-3.5" aria-hidden="true" />
                          {featured.tag}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                          <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                          {formatKstDateLong(featured.createdAt)}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-xl font-bold leading-snug tracking-tight text-slate-900 sm:text-2xl">
                          <Link href={featured.href} className="hover:underline">
                            {featured.title}
                          </Link>
                        </h3>
                        {featured.slug && (
                          <p className="text-sm leading-relaxed text-slate-600 line-clamp-3">
                            {/* excerpt는 BlogListCard에 없으므로 빈 상태 허용 */}
                          </p>
                        )}
                      </div>

                      <div className="mt-auto">
                        <Link
                          href={featured.href}
                          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-primary/90 hover:shadow-md"
                          aria-label="주요 인사이트 글 읽기"
                        >
                          기사 읽기
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              )}

              {/* 최신 포스트 그리드 */}
              {latest.length > 0 && (
                <>
                  <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold tracking-tight text-slate-900">
                        최신 기술 글
                      </h3>
                      <p className="text-sm text-slate-600">
                        제품 개발 히스토리를 기반으로 실전형 글을 쌓아갑니다.
                      </p>
                    </div>
                    <Link
                      href="/blog"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors duration-300 hover:text-primary/80"
                      aria-label="블로그 글 전체 보기"
                    >
                      전체 보기
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {latest.map((post) => (
                      <article
                        key={post.slug}
                        className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                      >
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                          <Image
                            src={post.coverImageUrl}
                            alt=""
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                          />
                        </div>

                        <div className="flex flex-col gap-4 p-5">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                              <TagIcon className="h-3.5 w-3.5" aria-hidden="true" />
                              {post.tag}
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                              {formatKstDateLong(post.createdAt)}
                            </span>
                          </div>

                          <h4 className="text-base font-bold leading-snug tracking-tight text-slate-900">
                            <Link href={post.href} className="hover:underline">
                              {post.title}
                            </Link>
                          </h4>
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              )}

              {/* 블로그 포스트가 없을 때 */}
              {posts.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center text-slate-500">
                  <p className="text-sm">곧 첫 번째 인사이트를 공개할 예정입니다.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Mini About ───────────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-10 shadow-sm sm:px-10">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-primary">CoreDXI</p>
                <p className="text-2xl font-bold tracking-tight text-slate-900">
                  우리는 지식을 공유하며 함께 성장하는 IT 전문가 집단,
                  CoreDXI입니다.
                </p>
                <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
                  기술을 &quot;보여주는 것&quot;에 그치지 않고, 고객의 비즈니스 문제를
                  해결하는 제품으로 연결합니다. 우리가 일하는 방식과 축적된
                  노하우를 확인해 보세요.
                </p>
              </div>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-primary/90 hover:shadow-md"
                aria-label="CoreDXI 회사 소개 더 보기"
              >
                CoreDXI 소개 더 보기
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
