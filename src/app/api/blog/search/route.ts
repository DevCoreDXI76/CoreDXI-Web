import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mapBlogPostToListCard } from "@/components/blog/types";

/** 발행된 블로그 글 검색 — 제목/요약/카테고리명 부분 일치(대소문자 무시) */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  const categorySlug = searchParams.get("category")?.trim();

  const rows = await prisma.blogPost.findMany({
    where: {
      status: "PUBLISHED",
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { excerpt: { contains: q, mode: "insensitive" } },
              { category: { name: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
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

  return NextResponse.json({ posts: rows.map(mapBlogPostToListCard) });
}
