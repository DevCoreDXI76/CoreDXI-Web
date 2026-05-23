"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { formatBlogMeta, type BlogListCard } from "./types";

type Props = {
  posts: BlogListCard[];
};

export function BlogPostGrid({ posts }: Props) {
  const searchParams = useSearchParams();
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!q) return posts;
    return posts.filter((p) => {
      const hay =
        `${p.title} ${p.subCategory} ${p.tag} ${p.author} ${p.category.name}`.toLowerCase();
      return hay.includes(q);
    });
  }, [posts, q]);

  if (filtered.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-500">
        {q ? "검색 결과가 없습니다." : "아직 공개된 글이 없습니다."}
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {filtered.map((post) => (
        <li key={post.slug}>
          <Link
            href={post.href}
            className="group flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl">
              <Image
                src={post.coverImageUrl}
                alt=""
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <span className="absolute right-3 top-3 rounded-md bg-white/90 px-2 py-1 text-xs font-semibold text-violet-700">
                {post.tag}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-4">
              <h2 className="line-clamp-2 font-bold text-slate-900">{post.title}</h2>
              <p className="mt-2 text-sm text-slate-500">{post.subCategory}</p>
              <p className="mt-1 text-sm text-slate-500">
                {formatBlogMeta(post.createdAt, post.updatedAt, post.author)}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
