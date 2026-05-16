"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { BlogPostStatus } from "@/generated/prisma/client";
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
import type { NotionEditorHandle } from "@/components/editor/NotionEditor";
import type { BlogPostContent } from "@/types/blocknote";
import { saveBlogPost } from "./actions";

const NotionEditorClient = dynamic(
  () =>
    import("@/components/editor/NotionEditor").then((m) => ({
      default: m.NotionEditor,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-lg border border-gray-200 bg-white px-4 py-12 text-center text-sm text-gray-500">
        에디터를 불러오는 중입니다…
      </div>
    ),
  }
);

/** [홍보팀] 블로그 카테고리 옵션 — 필요 시 값·라벨만 추가하면 됩니다. */
const BLOG_CATEGORIES = [
  "회사 소식",
  "기술·인사이트",
  "고객 사례",
  "미디어",
  "기타",
] as const;

export type BlogEditorInitial = {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  content: BlogPostContent;
  status: BlogPostStatus;
};

type Props = {
  mode: "create" | "edit";
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

export function BlogEditorForm({ mode, initial }: Props) {
  const router = useRouter();
  const reactId = useId();
  /** SSR/클라이언트에서 동일한 임시 업로드 경로·에디터 storageKey용 (hydration 안전) */
  const draftKey = useMemo(
    () => reactId.replace(/:/g, "").replace(/^-+|-+$/g, "") || "draft",
    [reactId]
  );

  const editorRef = useRef<NotionEditorHandle>(null);

  const [postId, setPostId] = useState<string | undefined>(initial?.id);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState(
    initial?.category ?? BLOG_CATEGORIES[0]
  );
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [, setDocumentJson] = useState<BlogPostContent>(
    initial?.content ?? []
  );
  const [pending, setPending] = useState(false);

  const categoryOptions = useMemo((): string[] => {
    const base: string[] = [...BLOG_CATEGORIES];
    if (initial?.category && !base.includes(initial.category)) {
      base.unshift(initial.category);
    }
    return base;
  }, [initial?.category]);

  const storageKey = useMemo(
    () => postId ?? `new-${draftKey}`,
    [postId, draftKey]
  );

  const uploadPrefix = postId ?? draftKey;

  const uploadFile = useMemo(
    () => (file: File) => uploadBlogImage(file, uploadPrefix),
    [uploadPrefix]
  );

  async function submit(status: BlogPostStatus) {
    if (pending) return;
    setPending(true);
    try {
      const content = editorRef.current?.getDocument() ?? [];
      const result = await saveBlogPost({
        id: postId,
        title,
        category,
        excerpt,
        content,
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
              카테고리
            </Label>
            <Select
              value={category}
              onValueChange={(v) => {
                if (v) setCategory(v);
              }}
            >
              <SelectTrigger id="blog-category" className="w-[200px] bg-white">
                <SelectValue placeholder="카테고리" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
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

        <NotionEditorClient
          ref={editorRef}
          storageKey={storageKey}
          initialContent={initial?.content ?? null}
          onChangeDocument={(json) => setDocumentJson(json)}
          uploadFile={uploadFile}
          editable
        />
      </div>
    </div>
  );
}
