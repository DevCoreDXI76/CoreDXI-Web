import { randomBytes } from "crypto";
import { slugifyTitle, uniqueSlug } from "@/lib/blog-slug";

/** 성공사례 제목 → URL slug (비ASCII 제목은 case-{hex}) */
export function slugifyPortfolioTitle(title: string): string {
  const base = slugifyTitle(title);
  if (base.startsWith("post-")) {
    return `case-${base.slice(5)}`;
  }
  if (base.length >= 2) return base;
  return `case-${randomBytes(5).toString("hex")}`;
}

export async function uniquePortfolioSlug(
  title: string,
  isTaken: (slug: string) => Promise<boolean>
): Promise<string> {
  const base = slugifyPortfolioTitle(title);
  let candidate = base;
  let n = 0;
  while (await isTaken(candidate)) {
    n += 1;
    candidate = `${base}-${n}`;
  }
  return candidate;
}
