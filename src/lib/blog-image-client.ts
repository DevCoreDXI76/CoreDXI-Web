import {
  assertUploadableImageSize,
  compressImageForUpload,
} from "@/lib/compress-image-for-upload";

export class BlogImageClientError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly body?: unknown
  ) {
    super(message);
    this.name = "BlogImageClientError";
  }
}

async function parseJsonResponse(res: Response): Promise<{
  url?: string;
  error?: string;
}> {
  try {
    return (await res.json()) as { url?: string; error?: string };
  } catch {
    return {};
  }
}

function errorMessageFromResponse(
  res: Response,
  data: { error?: string }
): string {
  if (data.error) return data.error;
  if (res.status === 413) {
    return "파일이 너무 큽니다. 더 작은 이미지를 선택하거나 다시 시도해 주세요.";
  }
  if (res.status === 403) return "업로드 권한이 없습니다. 다시 로그인해 주세요.";
  if (res.status === 503) {
    return "이미지 저장소 설정 오류입니다. 관리자에게 문의해 주세요.";
  }
  return "이미지 업로드에 실패했습니다.";
}

function logClientFailure(
  tag: string,
  res: Response,
  data: { url?: string; error?: string },
  extra?: Record<string, unknown>
) {
  console.error(`[blog-image] ${tag}`, {
    status: res.status,
    statusText: res.statusText,
    body: data,
    ...extra,
  });
}

/** FormData file → POST /api/admin/blog/upload-image */
export async function uploadBlogImageFile(
  file: File,
  prefix: string
): Promise<string> {
  assertUploadableImageSize(file);
  const prepared = await compressImageForUpload(file);

  const fd = new FormData();
  fd.set("file", prepared);
  fd.set("prefix", prefix);

  const res = await fetch("/api/admin/blog/upload-image", {
    method: "POST",
    body: fd,
  });

  const data = await parseJsonResponse(res);
  if (!res.ok) {
    logClientFailure("upload-image", res, data, {
      prefix,
      fileType: prepared.type,
      fileSize: prepared.size,
    });
    throw new BlogImageClientError(
      errorMessageFromResponse(res, data),
      res.status,
      data
    );
  }
  if (!data.url) {
    logClientFailure("upload-image", res, data, { prefix, reason: "missing url" });
    throw new BlogImageClientError("업로드 응답이 올바르지 않습니다.", res.status, data);
  }
  return data.url;
}

/** 외부 URL → POST /api/admin/blog/import-image */
export async function importBlogImageFromUrl(
  url: string,
  prefix: string
): Promise<string> {
  const res = await fetch("/api/admin/blog/import-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, prefix }),
  });

  const data = await parseJsonResponse(res);
  if (!res.ok) {
    logClientFailure("import-image", res, data, { prefix, sourceUrl: url });
    throw new BlogImageClientError(
      errorMessageFromResponse(res, data) ||
        "붙여넣은 이미지를 서버에 올리지 못했습니다.",
      res.status,
      data
    );
  }
  if (!data.url) {
    logClientFailure("import-image", res, data, { prefix, reason: "missing url" });
    throw new BlogImageClientError("업로드 응답이 올바르지 않습니다.", res.status, data);
  }
  return data.url;
}
