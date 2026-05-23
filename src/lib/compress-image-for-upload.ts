/** Vercel serverless 요청 본문 한도(4.5MB) 이하로 맞추기 위한 클라이언트 압축 */
const MAX_UPLOAD_BYTES = 3.5 * 1024 * 1024;
const MAX_EDGE_PX = 1600;
const JPEG_QUALITY = 0.82;

const SKIP_COMPRESS_TYPES = new Set([
  "image/gif",
  "image/svg+xml",
]);

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("이미지를 불러올 수 없습니다."));
    img.src = src;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("이미지 압축에 실패했습니다."));
          return;
        }
        resolve(blob);
      },
      type,
      quality
    );
  });
}

/** 업로드 전 리사이즈·JPEG 압축 (GIF/SVG·소용량 파일은 그대로) */
export async function compressImageForUpload(file: File): Promise<File> {
  if (typeof window === "undefined") return file;
  if (file.size <= MAX_UPLOAD_BYTES && SKIP_COMPRESS_TYPES.has(file.type)) {
    return file;
  }
  if (file.size <= 512 * 1024 && !file.type.startsWith("image/heic")) {
    return file;
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    const scale = Math.min(1, MAX_EDGE_PX / Math.max(img.width, img.height, 1));
    const width = Math.max(1, Math.round(img.width * scale));
    const height = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.drawImage(img, 0, 0, width, height);

    const outputType =
      file.type === "image/png" && file.size <= MAX_UPLOAD_BYTES
        ? "image/png"
        : "image/jpeg";
    const blob = await canvasToBlob(
      canvas,
      outputType,
      outputType === "image/jpeg" ? JPEG_QUALITY : undefined
    );

    if (blob.size >= file.size && file.size <= MAX_UPLOAD_BYTES) {
      return file;
    }

    const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
    const ext = outputType === "image/png" ? ".png" : ".jpg";
    return new File([blob], `${baseName}${ext}`, { type: outputType });
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function assertUploadableImageSize(file: File): void {
  if (file.size > 8 * 1024 * 1024) {
    throw new Error(
      "파일이 너무 큽니다. 8MB 이하 이미지를 선택하거나 더 작은 파일을 사용해 주세요."
    );
  }
}
