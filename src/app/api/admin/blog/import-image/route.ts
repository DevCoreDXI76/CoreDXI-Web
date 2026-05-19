import { NextResponse } from "next/server";
import { requireBlogEditor } from "@/lib/require-blog-editor";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

function sanitizeSegment(s: string, max: number): string {
  const t = s
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return t.slice(0, max) || "upload";
}

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
]);

/** 붙여넣기 HTML 등 외부 이미지 URL — 서버에서 받아 blog-images에 저장 (CORS 회피) */
export async function POST(req: Request) {
  const gate = await requireBlogEditor();
  if (!gate.ok) {
    return NextResponse.json({ error: gate.message }, { status: 403 });
  }

  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase 환경 변수가 설정되지 않았습니다." },
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

  const prefix = sanitizeSegment(body.prefix?.trim() ?? "import", 96);

  let res: Response;
  try {
    res = await fetch(rawUrl, {
      headers: { "User-Agent": "CoreDXI-Blog-Importer/1.0" },
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    return NextResponse.json(
      { error: "이미지를 가져오지 못했습니다. 「이미지」 버튼으로 파일을 선택해 주세요." },
      { status: 502 }
    );
  }

  if (!res.ok) {
    return NextResponse.json(
      { error: "이미지 URL에 접근할 수 없습니다." },
      { status: 502 }
    );
  }

  const contentType = (res.headers.get("content-type") ?? "").split(";")[0].trim();
  if (!contentType.startsWith("image/")) {
    return NextResponse.json(
      { error: "URL이 이미지가 아닙니다." },
      { status: 400 }
    );
  }

  const normalizedType = ALLOWED_TYPES.has(contentType)
    ? contentType
    : "image/png";

  const buffer = Buffer.from(await res.arrayBuffer());
  const maxBytes = 5 * 1024 * 1024;
  if (buffer.length > maxBytes) {
    return NextResponse.json(
      { error: "파일 크기는 5MB 이하여야 합니다." },
      { status: 400 }
    );
  }

  const extFromUrl = /\.([a-zA-Z0-9]+)(?:\?|$)/.exec(parsed.pathname)?.[1]?.toLowerCase();
  const ext =
    extFromUrl && extFromUrl.length <= 5
      ? `.${extFromUrl}`
      : `.${normalizedType.split("/")[1] ?? "png"}`;

  const path = `${prefix}/${crypto.randomUUID()}${ext}`;

  const { error } = await supabase.storage.from("blog-images").upload(path, buffer, {
    contentType: normalizedType,
    upsert: false,
  });

  if (error) {
    console.error("[import-image]", error);
    return NextResponse.json(
      { error: error.message || "스토리지 업로드에 실패했습니다." },
      { status: 500 }
    );
  }

  const { data } = supabase.storage.from("blog-images").getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
