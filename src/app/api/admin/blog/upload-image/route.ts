import { NextResponse } from "next/server";
import {
  BlogImageStorageError,
  extensionFromFileName,
  getSupabaseEnvErrorMessage,
  isAllowedImageFile,
  resolveImageContentType,
  sanitizeStoragePrefix,
  uploadBufferToBlogImages,
} from "@/lib/blog-image-storage";
import { requireBlogEditor } from "@/lib/require-blog-editor";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

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

  if (!isAllowedImageFile(file)) {
    return NextResponse.json(
      { error: "지원하지 않는 이미지 형식입니다. (JPEG, PNG, GIF, WebP, SVG)" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const prefix = sanitizeStoragePrefix(prefixRaw, 96);
  const ext = extensionFromFileName(file.name) || ".png";
  const contentType = resolveImageContentType(file);

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
      if (e.code !== "validation") {
        console.error("[upload-image]", { message: e.message, prefix });
      }
      return NextResponse.json({ error: e.message }, { status });
    }
    console.error("[upload-image] unexpected", e);
    return NextResponse.json(
      { error: "스토리지 업로드에 실패했습니다." },
      { status: 500 }
    );
  }
}
