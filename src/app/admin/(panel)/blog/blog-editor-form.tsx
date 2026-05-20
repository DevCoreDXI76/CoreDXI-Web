"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useMemo, useRef, useState } from "react";
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

const TiptapEditor = dynamic(
  () =>
    import("@/components/editor/TiptapEditor").then((m) => ({
      default: m.TiptapEditor,
    })),
  { ssr: false, loading: EditorLoadingFallback }
);

const BlockNoteReader = dynamic(
  () =>
    import("@/components/editor/BlockNoteReader").then((m) => ({
      default: m.BlockNoteReader,
    })),
  { ssr: false, loading: EditorLoadingFallback }
);
import {
  importBlogImageFromUrl,
  uploadBlogImageFile,
} from "@/lib/blog-image-client";
import {
  countBrokenImages,
  stripUnpersistedImages,
} from "@/lib/tiptap-content";
import {
  EMPTY_BLOG_DOC,
  isBlockNoteContent,
  isTiptapDocument,
  normalizeBlogContent,
  type BlogPostContent,
  type TiptapBlogContent,
} from "@/types/blocknote";
import type { TiptapEditorHandle } from "@/components/editor/TiptapEditor";
import { deleteBlogPost, saveBlogPost } from "./actions";
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
  const editorRef = useRef<TiptapEditorHandle>(null);

  const storageKey = useMemo(
    () => postId ?? `new-${draftKey}`,
    [postId, draftKey]
  );

  const uploadPrefix = postId ?? draftKey;

  const uploadFile = useMemo(
    () => (file: File) => uploadBlogImageFile(file, uploadPrefix),
    [uploadPrefix]
  );

  const importRemoteImage = useMemo(
    () => (url: string) => importBlogImageFromUrl(url, uploadPrefix),
    [uploadPrefix]
  );

  async function submit(status: "DRAFT" | "PUBLISHED") {
    if (pending) return;
    setPending(true);
    try {
      let contentToSave: BlogPostContent = documentJson;
      const latest = editorRef.current?.getDocument();
      if (latest && isTiptapDocument(latest)) {
        contentToSave = stripUnpersistedImages(latest);
        const broken = countBrokenImages(latest);
        if (broken > 0) {
          toast.warning(
            `본문에 서버에 저장되지 않은 이미지가 ${broken}개 있습니다. 「이미지」 버튼으로 다시 넣어 주세요.`
          );
        }
        setDocumentJson(contentToSave);
      }

      const result = await saveBlogPost({
        id: postId,
        title,
        categoryId,
        excerpt,
        content: contentToSave,
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

  async function removePost() {
    if (pending) return;
    if (!postId || mode !== "edit") return;
    const ok = window.confirm(
      "정말 삭제할까요? 이 작업은 되돌릴 수 없습니다."
    );
    if (!ok) return;

    setPending(true);
    try {
      const result = await deleteBlogPost(postId);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.replace("/admin/blog");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex h-[calc(100dvh-4rem)] max-h-[calc(100dvh-4rem)] flex-col gap-4 overflow-hidden lg:h-[calc(100dvh-5rem)] lg:max-h-[calc(100dvh-5rem)]">
      <div className="sticky top-0 z-20 flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-gray-50/95 py-4 backdrop-blur supports-[backdrop-filter]:bg-gray-50/80">
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
          {mode === "edit" && postId ? (
            <Button
              type="button"
              variant="destructive"
              disabled={pending}
              onClick={() => void removePost()}
            >
              삭제
            </Button>
          ) : null}
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

      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-5 min-h-0 px-1">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
          className="shrink-0 border-0 px-0 py-2 text-3xl font-semibold leading-tight shadow-none focus-visible:ring-0 min-h-[3.25rem] md:text-4xl"
          aria-label="제목"
        />

        <div className="shrink-0 space-y-1.5">
          <Label htmlFor="blog-excerpt">요약 (선택)</Label>
          <Textarea
            id="blog-excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="목록·검색 미리보기에 쓰일 짧은 요약"
            rows={2}
            className="resize-y bg-white"
          />
        </div>

        {isBlockNoteContent(documentJson) ? (
          <div className="space-y-4 rounded-lg border border-amber-200 bg-amber-50/80 p-4">
            <p className="text-sm text-amber-950">
              이 글은 BlockNote 형식으로 저장되어 있습니다. 아래는 읽기 전용
              미리보기입니다. Tiptap 에디터로 새로 작성하려면 버튼을 누르세요.
              (공개 페이지에는 기존 본문이 그대로 표시됩니다.)
            </p>
            <BlockNoteReader blocks={documentJson} />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="bg-white"
              onClick={() => setDocumentJson(EMPTY_BLOG_DOC)}
            >
              Tiptap 에디터로 새로 작성
            </Button>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <TiptapEditor
              ref={editorRef}
              key={storageKey}
              storageKey={storageKey}
              className="h-full min-h-0 flex-1"
              initialContent={documentJson}
              onChangeDocument={(doc: TiptapBlogContent) => setDocumentJson(doc)}
              uploadFile={uploadFile}
              importRemoteImage={importRemoteImage}
              editable
            />
          </div>
        )}
      </div>
    </div>
  );
}
