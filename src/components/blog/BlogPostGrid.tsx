"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatBlogMeta, type BlogListCard } from "./types";

type Props = {
  posts: BlogListCard[];
  categorySlug?: string;
};

function parseListCards(raw: BlogListCard[]): BlogListCard[] {
  return raw.map((post) => ({
    ...post,
    createdAt: new Date(post.createdAt),
    updatedAt: new Date(post.updatedAt),
  }));
}

export function BlogPostGrid({ posts, categorySlug }: Props) {
  const searchParams = useSearchParams();
  const q = (searchParams.get("q") ?? "").trim();

  const [searchResults, setSearchResults] = useState<BlogListCard[] | null>(
    null
  );
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!q) {
      setSearchResults(null);
      return;
    }

    let cancelled = false;
    setIsSearching(true);

    const params = new URLSearchParams({ q });
    if (categorySlug) params.set("category", categorySlug);

    fetch(`/api/blog/search?${params.toString()}`)
      .then((res) => res.json())
      .then((data: { posts: BlogListCard[] }) => {
        if (cancelled) return;
        setSearchResults(parseListCards(data.posts ?? []));
      })
      .catch(() => {
        if (!cancelled) setSearchResults([]);
      })
      .finally(() => {
        if (!cancelled) setIsSearching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [q, categorySlug]);

  const displayed = q ? (searchResults ?? []) : posts;

  if (q && isSearching && searchResults === null) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center text-muted-foreground">
        검색 중…
      </div>
    );
  }

  if (displayed.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center text-muted-foreground">
        {q ? "검색 결과가 없습니다." : "아직 공개된 글이 없습니다."}
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {displayed.map((post) => (
        <li key={post.slug}>
          <Link
            href={post.href}
            className="group flex h-full flex-col overflow-hidden rounded-xl bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl">
              <Image
                src={post.coverImageUrl}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <span className="absolute right-3 top-3 rounded-md bg-card/90 px-2 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300">
                {post.tag}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-4">
              <h2 className="line-clamp-2 font-bold text-foreground">{post.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{post.subCategory}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatBlogMeta(post.createdAt, post.updatedAt, post.author)}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
