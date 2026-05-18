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
    return NextResponse.json(
      { error: "Supabase 환경 변수(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)가 없습니다." },
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

  const buffer = Buffer.from(await file.arrayBuffer());
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
    return NextResponse.json({ error: "스토리지 업로드에 실패했습니다." }, { status: 500 });
  }

  const { data } = supabase.storage.from("blog-images").getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
