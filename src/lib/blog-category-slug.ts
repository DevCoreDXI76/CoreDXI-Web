import { randomBytes } from "crypto";
import { slugifyTitle, uniqueSlug } from "@/lib/blog-slug";

export const CATEGORY_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Returns normalized slug, or null if empty/invalid. */
export function normalizeCategorySlug(raw: string): string | null {
  const slug = raw.trim().toLowerCase();
  if (!slug) return null;
  if (slug.length < 2 || slug.length > 72 || !CATEGORY_SLUG_PATTERN.test(slug)) {
    return null;
  }
  return slug;
}

export function slugifyCategoryName(name: string): string {
  const s = slugifyTitle(name);
  if (s.length >= 2 && !s.startsWith("post-")) return s;
  return `topic-${randomBytes(4).toString("hex")}`;
}

export async function uniqueCategorySlug(
  name: string,
  isTaken: (slug: string) => Promise<boolean>
): Promise<string> {
  return uniqueSlug(name, isTaken);
}
