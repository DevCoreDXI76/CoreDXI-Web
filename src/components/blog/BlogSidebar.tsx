"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { cn } from "@/lib/utils";
import type { BlogCategoryItem } from "@/lib/blog-categories";
import { BlogSearch } from "./BlogSearch";

type Props = {
  categories: BlogCategoryItem[];
};

function navClass(active: boolean) {
  return cn(
    "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
    active
      ? "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300"
      : "text-muted-foreground hover:bg-muted"
  );
}

export function BlogSidebar({ categories }: Props) {
  const pathname = usePathname();

  const isHome = pathname === "/blog";

  return (
    <aside className="flex w-full shrink-0 flex-col lg:sticky lg:top-24 lg:w-60 lg:self-start">
      <h2 className="text-2xl font-bold tracking-tight text-foreground">블로그</h2>
      <nav className="mt-6 flex flex-col gap-0.5" aria-label="블로그 주제">
        <Link href="/blog" className={navClass(isHome)}>
          홈
        </Link>
        {categories.map((cat) => {
          const href = `/blog/category/${cat.slug}`;
          const active = pathname === href;
          return (
            <Link key={cat.id} href={href} className={navClass(active)}>
              {cat.name}
            </Link>
          );
        })}
      </nav>
      <Suspense fallback={<div className="mt-auto h-10 pt-6" />}>
        <BlogSearch />
      </Suspense>
    </aside>
  );
}
