"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
function EditorLoadingFallback() {
  return (
    <div className="p-10 text-center text-gray-500">
      에디터를 불러오는 중입니다...
    </div>
  );
}

const BlockEditor = dynamic(
  () =>
    import("@/components/editor/BlockEditor").then((m) => ({
      default: m.BlockEditor,
    })),
  { ssr: false, loading: EditorLoadingFallback }
);

const TiptapBlogReader = dynamic(
  () =>
    import("@/components/editor/TiptapBlogReader").then((m) => ({
      default: m.TiptapBlogReader,
    })),
  { ssr: false, loading: EditorLoadingFallback }
);
import {
  EMPTY_BLOCKNOTE_DOC,
  isBlockNoteContent,
  isTiptapDocument,
  normalizeBlogContent,
  type BlockNoteContent,
  type BlogPostContent,
} from "@/types/blocknote";
import { saveBlogPost } from "./actions";
import type { BlogCategoryItem } from "@/lib/blog-categories";

export type BlogEditorInitial = {
  id: string;
  title: string;
  categoryId: string;
  excerpt: string;
  content: BlogPostContent | unknown;
  status: "DRAFT" | "PUBLISHED";
};

type Props = {
  mode: "create" | "edit";
  categories: BlogCategoryItem[];
  initial?: BlogEditorInitial;
};

async function uploadBlogImage(file: File, prefix: string): Promise<string> {
  const fd = new FormData();
  fd.set("file", file);
  fd.set("prefix", prefix);
  const res = await fetch("/api/admin/blog/upload-image", {
    method: "POST",
    body: fd,
  });
  const data: { url?: string; error?: string } = await res.json();
  if (!res.ok) throw new Error(data.error ?? "이미지 업로드에 실패했습니다.");
  if (!data.url) throw new Error("업로드 응답이 올바르지 않습니다.");
  return data.url;
}

export function BlogEditorForm({ mode, categories, initial }: Props) {
  const router = useRouter();
  const reactId = useId();
  const draftKey = useMemo(
    () => reactId.replace(/:/g, "").replace(/^-+|-+$/g, "") || "draft",
    [reactId]
  );

  const [postId, setPostId] = useState<string | undefined>(initial?.id);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [categoryId, setCategoryId] = useState(
    initial?.categoryId ?? categories[0]?.id ?? ""
  );
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [documentJson, setDocumentJson] = useState<BlogPostContent>(() =>
    normalizeBlogContent(initial?.content)
  );
  const [pending, setPending] = useState(false);

  const storageKey = useMemo(
    () => postId ?? `new-${draftKey}`,
    [postId, draftKey]
  );

  const uploadPrefix = postId ?? draftKey;

  const uploadFile = useMemo(
    () => (file: File) => uploadBlogImage(file, uploadPrefix),
    [uploadPrefix]
  );

  async function submit(status: "DRAFT" | "PUBLISHED") {
    if (pending) return;
    setPending(true);
    try {
      const result = await saveBlogPost({
        id: postId,
        title,
        categoryId,
        excerpt,
        content: documentJson,
        status,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      if (!postId && result.id) {
        setPostId(result.id);
      }

      toast.success(result.message);

      if (mode === "create" && !initial?.id && result.id) {
        router.replace(`/admin/blog/${result.id}/edit`);
      }
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-gray-50/95 py-4 backdrop-blur supports-[backdrop-filter]:bg-gray-50/80">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/blog"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            목록
          </Link>
          <div className="flex items-center gap-2">
            <Label htmlFor="blog-category" className="sr-only">
              주제
            </Label>
            <Select
              value={categoryId}
              onValueChange={(v) => {
                if (v) setCategoryId(v);
              }}
            >
              <SelectTrigger id="blog-category" className="w-[200px] bg-white">
                <SelectValue placeholder="주제" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => void submit("DRAFT")}
          >
            임시저장
          </Button>
          <Button
            type="button"
            disabled={pending}
            onClick={() => void submit("PUBLISHED")}
          >
            발행하기
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-6 px-1">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
          className="border-0 px-0 text-3xl font-semibold shadow-none focus-visible:ring-0 md:text-4xl"
          aria-label="제목"
        />

        <div className="space-y-1.5">
          <Label htmlFor="blog-excerpt">요약 (선택)</Label>
          <Textarea
            id="blog-excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="목록·검색 미리보기에 쓰일 짧은 요약"
            rows={3}
            className="resize-y bg-white"
          />
        </div>

        {isTiptapDocument(documentJson) ? (
          <div className="space-y-4 rounded-lg border border-amber-200 bg-amber-50/80 p-4">
            <p className="text-sm text-amber-950">
              이 글은 이전 에디터(Tiptap) 형식으로 저장되어 있습니다. 아래는
              읽기 전용 미리보기입니다. 본문을 BlockNote로 새로 작성하려면
              버튼을 누르세요. (공개 페이지에는 그대로 표시됩니다.)
            </p>
            <TiptapBlogReader content={documentJson} />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="bg-white"
              onClick={() => setDocumentJson(EMPTY_BLOCKNOTE_DOC)}
            >
              BlockNote으로 새로 작성
            </Button>
          </div>
        ) : (
          <BlockEditor
            key={`${storageKey}-${isBlockNoteContent(documentJson) ? "bn" : "new"}`}
            storageKey={storageKey}
            initialContent={
              (initial?.content ?? null) as BlogPostContent | null
            }
            onChangeDocument={(doc: BlockNoteContent) =>
              setDocumentJson(doc)
            }
            uploadFile={uploadFile}
            editable
          />
        )}
      </div>
    </div>
  );
}
