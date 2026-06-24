import { formatKstDateLong } from "@/lib/format-kst-date";

export type BlogPostCard = {
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl?: string | null;
  publishedAt: Date | null;
  updatedAt?: Date | null;
  category: { name: string; slug: string };
};

export type BlogListCard = {
  slug: string;
  title: string;
  href: string;
  tag: string;
  subCategory: string;
  coverImageUrl: string;
  createdAt: Date;
  updatedAt: Date;
  author: string;
  category: { name: string; slug: string };
};

const COVER_IMAGES = [
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1488229297570-58520851e868?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1600&q=80",
];

export function formatBlogMeta(
  createdAt: Date,
  updatedAt: Date,
  author: string
): string {
  const created = formatKstDateLong(createdAt);
  const updated =
    updatedAt.getTime() !== createdAt.getTime()
      ? ` (수정: ${formatKstDateLong(updatedAt)})`
      : "";
  return `${created}${updated} · ${author}`;
}

export function blogCoverImageFromSlug(slug: string): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash + slug.charCodeAt(i) * (i + 1)) % COVER_IMAGES.length;
  }
  return COVER_IMAGES[hash]!;
}

export function mapBlogPostToListCard(post: BlogPostCard): BlogListCard {
  const createdAt = post.publishedAt ?? new Date();
  const updatedAt = post.updatedAt ?? createdAt;

  return {
    slug: post.slug,
    title: post.title,
    href: `/blog/${post.slug}`,
    tag: post.category.name,
    subCategory: post.category.name,
    coverImageUrl: post.coverImageUrl ?? blogCoverImageFromSlug(post.slug),
    createdAt,
    updatedAt,
    author: "CoreDXI",
    category: post.category,
  };
}
