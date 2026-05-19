/** 클립보드에서 이미지 File 추출 (스크린샷·파일 복사) */
export function getImageFileFromClipboard(
  clipboard: DataTransfer
): File | null {
  if (clipboard.files?.length) {
    for (let i = 0; i < clipboard.files.length; i++) {
      const f = clipboard.files[i];
      if (f.type.startsWith("image/")) return f;
    }
  }

  if (clipboard.items?.length) {
    for (let i = 0; i < clipboard.items.length; i++) {
      const item = clipboard.items[i];
      if (!item.type.startsWith("image/")) continue;
      const blob = item.getAsFile();
      if (blob) return blob;
    }
  }

  return null;
}

/** data:image/...;base64,... → File */
export function dataUrlToImageFile(dataUrl: string): File | null {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl.trim());
  if (!match) return null;
  const mime = match[1];
  const b64 = match[2];
  try {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const ext = mime.split("/")[1]?.replace("+xml", "") || "png";
    return new File([bytes], `pasted.${ext}`, { type: mime });
  } catch {
    return null;
  }
}

/** HTML 붙여넣기에서 첫 img src */
export function getFirstImageSrcFromHtml(html: string): string | null {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const src = doc.querySelector("img")?.getAttribute("src")?.trim();
  return src || null;
}
