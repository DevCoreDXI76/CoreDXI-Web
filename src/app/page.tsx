import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Eye,
  Heart,
  Tag as TagIcon,
  User,
} from "lucide-react";
import { Header } from "@/components/Header";

type MockPost = {
  id: string;
  href: string;
  tag: string;
  title: string;
  excerpt: string;
  dateLabel: string;
  author: string;
  coverImageUrl: string;
  stats: { likes: number; views: number };
};

const mockPosts: MockPost[] = [
  {
    id: "featured-001",
    href: "/blog/kakao-naver-social-login-edge-cases",
    tag: "Tech Trend",
    title: "카카오/네이버 소셜 로그인 연동 시 발생할 수 있는 예외 처리 총정리",
    excerpt:
      "OAuth 콜백, 사용자 프로필 동기화, 중복 계정 병합, 리다이렉트 도메인 이슈까지. 실서비스에서 자주 터지는 케이스를 체크리스트로 정리했습니다.",
    dateLabel: "2026-05-20",
    author: "CoreDXI Engineering",
    coverImageUrl:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=80",
    stats: { likes: 128, views: 4210 },
  },
  {
    id: "post-002",
    href: "/blog/prisma-jsonb-tiptap-content",
    tag: "Prisma DB",
    title: "Prisma JSONB로 Tiptap 콘텐츠 저장하기: 마이그레이션 없는 확장 전략",
    excerpt:
      "HTML 대신 Tiptap JSON을 그대로 저장하면 무엇이 좋아질까요? 검색·렌더링·호환성 관점에서 실전 설계를 공유합니다.",
    dateLabel: "2026-05-18",
    author: "Platform Team",
    coverImageUrl:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1600&q=80",
    stats: { likes: 74, views: 2312 },
  },
  {
    id: "post-003",
    href: "/blog/github-actions-cicd-next15-vercel",
    tag: "CI/CD",
    title: "GitHub Actions로 Next.js 15 배포 파이프라인 안정화하기",
    excerpt:
      "캐시, 타입체크, 프리뷰 배포, 환경 변수 검증까지. 배포 실패를 줄이는 ‘작은 자동화’들의 조합을 정리했습니다.",
    dateLabel: "2026-05-16",
    author: "DevOps",
    coverImageUrl:
      "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=1600&q=80",
    stats: { likes: 52, views: 1840 },
  },
  {
    id: "post-004",
    href: "/blog/tiptap-editor-advanced-link-table",
    tag: "Tiptap 에디터 고도화",
    title: "링크·표 편집 UX 고도화: Tiptap Extensions를 제품 수준으로 다듬는 법",
    excerpt:
      "툴바 고정, 내부 스크롤, table 스타일, link 토글까지. 관리자 에디터를 ‘쓸만한 도구’로 만드는 디테일을 담았습니다.",
    dateLabel: "2026-05-14",
    author: "Frontend Guild",
    coverImageUrl:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1600&q=80",
    stats: { likes: 89, views: 2976 },
  },
  {
    id: "post-005",
    href: "/blog/supabase-image-paste-import",
    tag: "Supabase",
    title: "붙여넣기 이미지가 안 올라갈 때: CORS, import API, 저장 동기화",
    excerpt:
      "외부 이미지 URL, 브라우저 CORS, 서버 사이드 import까지. 에디터 이미지 파이프라인을 견고하게 만드는 방법을 정리했습니다.",
    dateLabel: "2026-05-11",
    author: "CoreDXI Engineering",
    coverImageUrl:
      "https://images.unsplash.com/photo-1488229297570-58520851e868?auto=format&fit=crop&w=1600&q=80",
    stats: { likes: 41, views: 1392 },
  },
];

/**
 * 홈페이지 컴포넌트
 * SEO를 위해 <header>와 <main> Semantic 태그를 명확히 분리합니다.
 */
export default function HomePage() {
  const featured = mockPosts[0]!;
  const latest = mockPosts.slice(1);

  return (
    <>
      <Header />

      <main className="bg-slate-50 pt-16">
        {/* Featured */}
        <section className="mx-auto max-w-7xl px-4 pb-10 pt-10 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between gap-6">
            <div className="space-y-2">
              <p className="text-sm font-semibold tracking-tight text-indigo-600">
                오늘의 주요 기술 인사이트
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                최신 업데이트와 실전 인사이트를 매거진처럼.
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-slate-600">
                CoreDXI의 제품 개발 과정에서 얻은 지식과 시행착오를 공개합니다.
                빠르게 훑고, 깊이 있게 적용할 수 있도록 구성했어요.
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

          <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
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
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                    <TagIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    {featured.tag}
                  </span>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                      {featured.dateLabel}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" aria-hidden="true" />
                      {featured.author}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h2 className="text-xl font-bold leading-snug tracking-tight text-slate-900 sm:text-2xl">
                    <Link href={featured.href} className="hover:underline">
                      {featured.title}
                    </Link>
                  </h2>
                  <p className="text-sm leading-relaxed text-slate-600">
                    {featured.excerpt}
                  </p>
                </div>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <Heart className="h-4 w-4 text-indigo-600" aria-hidden="true" />
                      {featured.stats.likes.toLocaleString()}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Eye className="h-4 w-4" aria-hidden="true" />
                      {featured.stats.views.toLocaleString()}
                    </span>
                  </div>
                  <Link
                    href={featured.href}
                    className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-indigo-600/90 hover:shadow-md"
                    aria-label="주요 인사이트 글 읽기"
                  >
                    기사 읽기
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </article>
        </section>

        {/* Latest grid */}
        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
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
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition-colors duration-300 hover:text-indigo-700"
              aria-label="블로그 글 전체 보기"
            >
              전체 보기
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {latest.map((post) => (
              <article
                key={post.id}
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
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                      <TagIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      {post.tag}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                      <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                      {post.dateLabel}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-base font-bold leading-snug tracking-tight text-slate-900">
                      <Link href={post.href} className="hover:underline">
                        {post.title}
                      </Link>
                    </h4>
                    <p className="line-clamp-3 text-sm leading-relaxed text-slate-600">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-1 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <User className="h-4 w-4" aria-hidden="true" />
                      {post.author}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="inline-flex items-center gap-1.5">
                        <Heart className="h-4 w-4 text-indigo-600" aria-hidden="true" />
                        {post.stats.likes.toLocaleString()}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Eye className="h-4 w-4" aria-hidden="true" />
                        {post.stats.views.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Mini about */}
        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-10 shadow-sm sm:px-10">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-indigo-600">CoreDXI</p>
                <p className="text-2xl font-bold tracking-tight text-slate-900">
                  우리는 지식을 공유하며 함께 성장하는 IT 전문가 집단, CoreDXI입니다.
                </p>
                <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
                  기술을 “보여주는 것”에 그치지 않고, 고객의 비즈니스 문제를
                  해결하는 제품으로 연결합니다. 우리가 일하는 방식과 축적된
                  노하우를 확인해 보세요.
                </p>
              </div>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-indigo-600/90 hover:shadow-md"
                aria-label="CoreDXI 회사 소개 더 보기"
              >
                CoreDXI 소개 더 보기
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <p className="text-lg font-bold tracking-tight text-slate-900">
                  CoreDXI
                </p>
                <p className="text-sm text-slate-500">
                  © 2026 CoreDXI. All rights reserved.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600">
                <Link
                  href="/terms"
                  className="transition-colors duration-300 hover:text-slate-900"
                >
                  이용약관
                </Link>
                <Link
                  href="/privacy"
                  className="transition-colors duration-300 hover:text-slate-900"
                >
                  개인정보처리방침
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 text-indigo-600 transition-colors duration-300 hover:text-indigo-700"
                >
                  문의하기
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
