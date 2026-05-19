import type { JSONContent } from "@tiptap/core";
import type { TiptapBlogContent } from "@/types/blocknote";

/** 저장·재편집에 쓸 수 없는 이미지 URL (blob, data URL 등) */
export function isEphemeralImageSrc(src: string | null | undefined): boolean {
  if (!src?.trim()) return true;
  const s = src.trim().toLowerCase();
  return (
    s.startsWith("blob:") ||
    s.startsWith("data:") ||
    s.startsWith("file:") ||
    s === "undefined" ||
    s === "null"
  );
}

/** Supabase blog-images에 올라간 URL인지 */
export function isBlogStorageImageSrc(src: string): boolean {
  if (isEphemeralImageSrc(src)) return false;
  return src.includes("/storage/v1/object/public/blog-images/");
}

/** 붙여넣기 등으로 들어온 외부 이미지(재로드 시 깨지기 쉬움) */
export function isExternalHotlinkImageSrc(src: string): boolean {
  if (isEphemeralImageSrc(src)) return true;
  if (isBlogStorageImageSrc(src)) return false;
  try {
    const host = new URL(src).hostname.toLowerCase();
    return (
      host.includes("googleusercontent.com") ||
      host === "www.google.com" ||
      host.endsWith(".google.com")
    );
  } catch {
    return true;
  }
}

function walkNodes(
  node: JSONContent,
  visit: (node: JSONContent) => void
): void {
  visit(node);
  if (Array.isArray(node.content)) {
    for (const child of node.content) {
      walkNodes(child, visit);
    }
  }
}

/** Tiptap JSON에서 깨진·임시 이미지 노드 제거 */
export function stripUnpersistedImages(doc: TiptapBlogContent): TiptapBlogContent {
  const cloned = JSON.parse(JSON.stringify(doc)) as TiptapBlogContent;

  const prune = (nodes: JSONContent[] | undefined): JSONContent[] | undefined => {
    if (!nodes) return nodes;
    return nodes
      .filter((node) => {
        if (node.type !== "image") return true;
        const src = (node.attrs as { src?: string } | undefined)?.src;
        return !isEphemeralImageSrc(src);
      })
      .map((node) => {
        if (node.content) {
          return { ...node, content: prune(node.content) };
        }
        return node;
      });
  };

  if (cloned.content) {
    cloned.content = prune(cloned.content) ?? [];
  }
  return cloned;
}

export function countBrokenImages(doc: TiptapBlogContent): number {
  let n = 0;
  walkNodes(doc, (node) => {
    if (node.type !== "image") return;
    const src = (node.attrs as { src?: string } | undefined)?.src;
    if (isEphemeralImageSrc(src) || (src && isExternalHotlinkImageSrc(src))) {
      n += 1;
    }
  });
  return n;
}
