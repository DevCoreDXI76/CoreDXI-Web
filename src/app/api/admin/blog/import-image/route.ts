import { NextResponse } from "next/server";
import {
  BlogImageStorageError,
  extensionFromUrlPath,
  getSupabaseEnvErrorMessage,
  normalizeImageContentType,
  sanitizeStoragePrefix,
  uploadBufferToBlogImages,
} from "@/lib/blog-image-storage";
import { requireBlogEditor } from "@/lib/require-blog-editor";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

/** 붙여넣기 HTML 등 외부 이미지 URL — 서버에서 받아 blog-images에 저장 (CORS 회피) */
export async function POST(req: Request) {
  const gate = await requireBlogEditor();
  if (!gate.ok) {
    return NextResponse.json({ error: gate.message }, { status: 403 });
  }

  if (!createSupabaseAdmin()) {
    return NextResponse.json(
      { error: getSupabaseEnvErrorMessage() },
      { status: 503 }
    );
  }

  let body: { url?: string; prefix?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON 본문이 필요합니다." }, { status: 400 });
  }

  const rawUrl = body.url?.trim();
  if (!rawUrl) {
    return NextResponse.json({ error: "url 필드가 필요합니다." }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return NextResponse.json({ error: "유효한 URL이 아닙니다." }, { status: 400 });
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return NextResponse.json({ error: "http(s) URL만 지원합니다." }, { status: 400 });
  }

  const prefix = sanitizeStoragePrefix(body.prefix?.trim() ?? "import", 96);

  let res: Response;
  try {
    res = await fetch(rawUrl, {
      headers: { "User-Agent": "CoreDXI-Blog-Importer/1.0" },
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
    });
  } catch (fetchErr) {
    console.error("[import-image] fetch failed", {
      url: rawUrl,
      error: fetchErr,
    });
    return NextResponse.json(
      {
        error:
          "이미지를 가져오지 못했습니다. 「이미지」 버튼으로 파일을 선택해 주세요.",
      },
      { status: 502 }
    );
  }

  if (!res.ok) {
    console.error("[import-image] fetch not ok", {
      url: rawUrl,
      status: res.status,
      statusText: res.statusText,
    });
    return NextResponse.json(
      { error: "이미지 URL에 접근할 수 없습니다." },
      { status: 502 }
    );
  }

  const contentType = normalizeImageContentType(
    res.headers.get("content-type") ?? "image/png"
  );
  if (!contentType.startsWith("image/")) {
    return NextResponse.json(
      { error: "URL이 이미지가 아닙니다." },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  const ext = extensionFromUrlPath(parsed.pathname, contentType);

  try {
    const { publicUrl } = await uploadBufferToBlogImages(buffer, {
      prefix,
      contentType,
      ext,
    });
    return NextResponse.json({ url: publicUrl });
  } catch (e) {
    if (e instanceof BlogImageStorageError) {
      const status =
        e.code === "env" ? 503 : e.code === "validation" ? 400 : 500;
      console.error("[import-image] storage failed", {
        url: rawUrl,
        prefix,
        message: e.message,
      });
      return NextResponse.json({ error: e.message }, { status });
    }
    console.error("[import-image] unexpected", e);
    return NextResponse.json(
      { error: "스토리지 업로드에 실패했습니다." },
      { status: 500 }
    );
  }
}
