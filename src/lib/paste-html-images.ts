import { dataUrlToImageFile } from "@/lib/clipboard-image";
import {
  isBlogStorageImageSrc,
  isEphemeralImageSrc,
} from "@/lib/tiptap-content";

function normalizedPasteText(value: string): string {
  return value.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

/** 붙여넣기에 본문 텍스트가 포함되는지 (이미지+글 복사) */
export function hasMeaningfulPasteText(
  html: string | null | undefined,
  plain: string | null | undefined
): boolean {
  const fromHtml = html
    ? normalizedPasteText(
        new DOMParser().parseFromString(html, "text/html").body.textContent ?? ""
      )
    : "";
  const fromPlain = normalizedPasteText(plain ?? "");
  const text =
    fromHtml.length >= fromPlain.length ? fromHtml : fromPlain;
  return text.length >= 2;
}

/** 스크린샷·이미지 파일만 붙여넣기 (텍스트 없음) */
export function isImageOnlyClipboard(clipboard: DataTransfer): boolean {
  const html = clipboard.getData("text/html");
  const plain = clipboard.getData("text/plain");
  if (hasMeaningfulPasteText(html, plain)) return false;

  if (html?.includes("<img")) return true;

  if (clipboard.items?.length === 1) {
    return clipboard.items[0].type.startsWith("image/");
  }

  return false;
}

export function htmlContainsExternalImages(html: string): boolean {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return Array.from(doc.querySelectorAll("img")).some((img) => {
    const src = img.getAttribute("src")?.trim();
    if (!src || isBlogStorageImageSrc(src) || isEphemeralImageSrc(src)) {
      return false;
    }
    return true;
  });
}

/** HTML 내 img src를 Supabase URL로 치환한 뒤 body innerHTML 반환 */
export async function hostImagesInHtml(
  html: string,
  handlers: {
    uploadFile: (file: File) => Promise<string>;
    importRemote: (url: string) => Promise<string>;
  }
): Promise<string> {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const imgs = Array.from(doc.querySelectorAll("img"));

  await Promise.all(
    imgs.map(async (img) => {
      const src = img.getAttribute("src")?.trim();
      if (!src || isBlogStorageImageSrc(src)) return;

      if (isEphemeralImageSrc(src)) {
        img.remove();
        return;
      }

      try {
        let newUrl: string;
        if (src.startsWith("data:image/")) {
          const file = dataUrlToImageFile(src);
          if (!file) {
            img.remove();
            return;
          }
          newUrl = await handlers.uploadFile(file);
        } else {
          newUrl = await handlers.importRemote(src);
        }
        img.setAttribute("src", newUrl);
      } catch (e) {
        console.error("[paste-html-images] image host failed", { src, e });
      }
    })
  );

  return doc.body.innerHTML;
}
