import { randomBytes } from "crypto";
import { slugifyTitle, uniqueSlug } from "@/lib/blog-slug";

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
