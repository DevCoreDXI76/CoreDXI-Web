import { createSupabaseAdmin } from "@/lib/supabase/admin";

export const BLOG_IMAGES_BUCKET = "blog-images";
export const MAX_BLOG_IMAGE_BYTES = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
]);

export function sanitizeStoragePrefix(s: string, max: number): string {
  const t = s
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return t.slice(0, max) || "upload";
}

export function getMissingSupabaseEnvVars(): string[] {
  return [
    !process.env.NEXT_PUBLIC_SUPABASE_URL && "NEXT_PUBLIC_SUPABASE_URL",
    !process.env.SUPABASE_SERVICE_ROLE_KEY && "SUPABASE_SERVICE_ROLE_KEY",
  ].filter(Boolean) as string[];
}

export function getSupabaseEnvErrorMessage(): string {
  const missing = getMissingSupabaseEnvVars();
  return `Supabase 환경 변수가 설정되지 않았습니다: ${missing.join(", ")}. Vercel·로컬 .env에 추가 후 재배포하세요.`;
}

export class BlogImageStorageError extends Error {
  constructor(
    message: string,
    readonly code: "env" | "upload" | "validation" = "upload"
  ) {
    super(message);
    this.name = "BlogImageStorageError";
  }
}

export type UploadBufferOptions = {
  prefix: string;
  contentType: string;
  ext: string;
};

export type UploadBufferResult = {
  publicUrl: string;
  path: string;
};

/** Supabase blog-images 버킷에 버퍼 업로드 후 public URL 반환 */
export async function uploadBufferToBlogImages(
  buffer: Buffer,
  options: UploadBufferOptions
): Promise<UploadBufferResult> {
  if (buffer.length > MAX_BLOG_IMAGE_BYTES) {
    throw new BlogImageStorageError(
      "파일 크기는 5MB 이하여야 합니다.",
      "validation"
    );
  }

  const supabase = createSupabaseAdmin();
  if (!supabase) {
    throw new BlogImageStorageError(getSupabaseEnvErrorMessage(), "env");
  }

  const prefix = sanitizeStoragePrefix(options.prefix, 96);
  const ext = options.ext.startsWith(".") ? options.ext : `.${options.ext}`;
  const path = `${prefix}/${crypto.randomUUID()}${ext}`;

  const { error } = await supabase.storage
    .from(BLOG_IMAGES_BUCKET)
    .upload(path, buffer, {
      contentType: options.contentType || "application/octet-stream",
      upsert: false,
    });

  if (error) {
    console.error("[blog-image-storage] upload failed", {
      path,
      message: error.message,
      name: error.name,
    });
    const message =
      error.message?.includes("Bucket not found") ||
      error.message?.includes("bucket")
        ? "Supabase Storage에 blog-images 버킷이 없습니다. 대시보드에서 public 버킷을 생성해 주세요."
        : error.message || "스토리지 업로드에 실패했습니다.";
    throw new BlogImageStorageError(message, "upload");
  }

  const { data } = supabase.storage.from(BLOG_IMAGES_BUCKET).getPublicUrl(path);
  return { publicUrl: data.publicUrl, path };
}

export function normalizeImageContentType(contentType: string): string {
  const base = contentType.split(";")[0].trim();
  if (ALLOWED_IMAGE_TYPES.has(base)) return base;
  return "image/png";
}

export function extensionFromFileName(fileName: string): string {
  const extMatch = /\.([a-zA-Z0-9]+)$/.exec(fileName);
  return extMatch ? `.${extMatch[1].toLowerCase()}` : "";
}

export function extensionFromUrlPath(pathname: string, fallbackType: string): string {
  const extFromUrl = /\.([a-zA-Z0-9]+)(?:\?|$)/.exec(pathname)?.[1]?.toLowerCase();
  if (extFromUrl && extFromUrl.length <= 5) return `.${extFromUrl}`;
  return `.${fallbackType.split("/")[1] ?? "png"}`;
}
