import { randomBytes } from "crypto";

/**
 * 제목으로 URL slug 생성. 비ASCII만 있으면 짧은 무작위 slug 사용.
 */
export function slugifyTitle(title: string): string {
  const s = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);

  if (s.length >= 2) return s;
  return `post-${randomBytes(5).toString("hex")}`;
}

export async function uniqueSlug(
  title: string,
  isTaken: (slug: string) => Promise<boolean>
): Promise<string> {
  const base = slugifyTitle(title);
  let candidate = base;
  let n = 0;
  while (await isTaken(candidate)) {
    n += 1;
    candidate = `${base}-${n}`;
  }
  return candidate;
}
