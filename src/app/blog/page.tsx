import type { Metadata } from "next";
import { Suspense } from "react";
import { BlogPostGrid } from "@/components/blog/BlogPostGrid";
import type { BlogListCard } from "@/components/blog/types";

export const metadata: Metadata = {
  title: "블로그 — CoreDXI",
  description: "CoreDXI 소식·인사이트·고객 사례를 만나보세요.",
};

const mockPosts: BlogListCard[] = [
  {
    slug: "deep-learning-cx-insights",
    title: "딥러닝으로 고객 의도를 읽는 법: CX 데이터 파이프라인 설계",
    href: "/blog/deep-learning-cx-insights",
    tag: "AI",
    subCategory: "AI-CX 개념허브",
    coverImageUrl:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1600&q=80",
    createdAt: new Date("2024-10-16"),
    updatedAt: new Date("2026-05-23"),
    author: "Tena",
    category: { name: "AI-CX 개념허브", slug: "ai-cx" },
  },
  {
    slug: "machine-learning-chatbot-metrics",
    title: "머신러닝 챗봇 KPI 설계: 해결률·이탈률·CSAT을 함께 보는 방법",
    href: "/blog/machine-learning-chatbot-metrics",
    tag: "AI",
    subCategory: "AI 챗봇",
    coverImageUrl:
      "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=1600&q=80",
    createdAt: new Date("2025-01-08"),
    updatedAt: new Date("2025-01-08"),
    author: "CoreDXI",
    category: { name: "AI 챗봇", slug: "ai-chatbot" },
  },
  {
    slug: "ai-chatbot-omnichannel",
    title: "AI 챗봇 옴니채널 운영: 카카오·웹·앱에서 일관된 응대 경험 만들기",
    href: "/blog/ai-chatbot-omnichannel",
    tag: "AI",
    subCategory: "AI 챗봇",
    coverImageUrl:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=80",
    createdAt: new Date("2025-03-12"),
    updatedAt: new Date("2026-04-02"),
    author: "Product Team",
    category: { name: "AI 챗봇", slug: "ai-chatbot" },
  },
  {
    slug: "tiptap-editor-advanced-link-table",
    title: "Tiptap 에디터 고도화: 링크·표·미디어까지 제품 수준 UX로",
    href: "/blog/tiptap-editor-advanced-link-table",
    tag: "Tech",
    subCategory: "Tiptap 에디터 고도화",
    coverImageUrl:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1600&q=80",
    createdAt: new Date("2026-05-14"),
    updatedAt: new Date("2026-05-14"),
    author: "Frontend Guild",
    category: { name: "Tech Trend", slug: "tech-trend" },
  },
  {
    slug: "prisma-jsonb-tiptap-content",
    title: "Prisma JSONB로 Tiptap 콘텐츠 저장하기: 마이그레이션 없는 확장 전략",
    href: "/blog/prisma-jsonb-tiptap-content",
    tag: "Tech",
    subCategory: "Tech Trend",
    coverImageUrl:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1600&q=80",
    createdAt: new Date("2026-05-18"),
    updatedAt: new Date("2026-05-18"),
    author: "Platform Team",
    category: { name: "Tech Trend", slug: "tech-trend" },
  },
  {
    slug: "supabase-image-paste-import",
    title: "붙여넣기 이미지 업로드 파이프라인: CORS·import API·동기화",
    href: "/blog/supabase-image-paste-import",
    tag: "Tech",
    subCategory: "Tech Trend",
    coverImageUrl:
      "https://images.unsplash.com/photo-1488229297570-58520851e868?auto=format&fit=crop&w=1600&q=80",
    createdAt: new Date("2026-05-11"),
    updatedAt: new Date("2026-05-11"),
    author: "CoreDXI Engineering",
    category: { name: "Tech Trend", slug: "tech-trend" },
  },
];

export default function BlogIndexPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 text-center text-sm text-slate-500">불러오는 중…</div>
      }
    >
      <BlogPostGrid posts={mockPosts} />
    </Suspense>
  );
}
