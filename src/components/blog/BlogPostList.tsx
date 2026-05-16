"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { BlogPostCard } from "./types";

type Props = {
  posts: BlogPostCard[];
};

export function BlogPostList({ posts }: Props) {
  const searchParams = useSearchParams();
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!q) return posts;
    return posts.filter((p) => {
      const hay = `${p.title} ${p.excerpt ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [posts, q]);

  if (filtered.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center text-gray-500">
        {q ? "검색 결과가 없습니다." : "아직 공개된 글이 없습니다."}
      </div>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {filtered.map((p) => (
        <li key={p.slug}>
          <Link
            href={`/blog/${p.slug}`}
            className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <p className="text-xs font-medium text-[#1E4E8C]">{p.category.name}</p>
            <h2 className="mt-1 text-lg font-semibold text-gray-900">{p.title}</h2>
            {p.excerpt ? (
              <p className="mt-2 line-clamp-3 flex-1 text-sm text-gray-600">
                {p.excerpt}
              </p>
            ) : (
              <div className="flex-1" />
            )}
            {p.publishedAt ? (
              <p className="mt-3 text-xs text-gray-400">
                {p.publishedAt.toLocaleDateString("ko-KR")}
              </p>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}
