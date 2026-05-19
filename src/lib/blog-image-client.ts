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
  const fd = new FormData();
  fd.set("file", file);
  fd.set("prefix", prefix);

  const res = await fetch("/api/admin/blog/upload-image", {
    method: "POST",
    body: fd,
  });

  const data = await parseJsonResponse(res);
  if (!res.ok) {
    logClientFailure("upload-image", res, data, { prefix, fileType: file.type });
    throw new BlogImageClientError(
      data.error ?? "이미지 업로드에 실패했습니다.",
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
      data.error ?? "붙여넣은 이미지를 서버에 올리지 못했습니다.",
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
