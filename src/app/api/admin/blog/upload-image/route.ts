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

export async function POST(req: Request) {
  const gate = await requireBlogEditor();
  if (!gate.ok) {
    return NextResponse.json({ error: gate.message }, { status: 403 });
  }

  const supabase = createSupabaseAdmin();
  if (!supabase) {
    const missing = [
      !process.env.NEXT_PUBLIC_SUPABASE_URL && "NEXT_PUBLIC_SUPABASE_URL",
      !process.env.SUPABASE_SERVICE_ROLE_KEY && "SUPABASE_SERVICE_ROLE_KEY",
    ].filter(Boolean) as string[];
    return NextResponse.json(
      {
        error: `Supabase 환경 변수가 설정되지 않았습니다: ${missing.join(", ")}. Vercel·로컬 .env에 추가 후 재배포하세요.`,
      },
      { status: 503 }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "multipart 요청이 아닙니다." }, { status: 400 });
  }

  const file = formData.get("file");
  const prefixRaw = (formData.get("prefix") as string | null)?.trim() ?? "temp";

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "file 필드가 필요합니다." }, { status: 400 });
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ];
  if (file.type && !allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "지원하지 않는 이미지 형식입니다. (JPEG, PNG, GIF, WebP, SVG)" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const maxBytes = 5 * 1024 * 1024;
  if (buffer.length > maxBytes) {
    return NextResponse.json(
      { error: "파일 크기는 5MB 이하여야 합니다." },
      { status: 400 }
    );
  }
  const prefix = sanitizeSegment(prefixRaw, 96);
  const extMatch = /\.([a-zA-Z0-9]+)$/.exec(file.name);
  const ext = extMatch ? `.${extMatch[1].toLowerCase()}` : "";
  const path = `${prefix}/${crypto.randomUUID()}${ext}`;

  const { error } = await supabase.storage.from("blog-images").upload(path, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (error) {
    console.error("[upload-image]", error);
    const message =
      error.message?.includes("Bucket not found") ||
      error.message?.includes("bucket")
        ? "Supabase Storage에 blog-images 버킷이 없습니다. 대시보드에서 public 버킷을 생성해 주세요."
        : error.message || "스토리지 업로드에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const { data } = supabase.storage.from("blog-images").getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
