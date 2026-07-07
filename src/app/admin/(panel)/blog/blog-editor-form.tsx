"use client";

import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { isBlockNoteContent } from "@/types/blocknote";
import type { TiptapBlogContent } from "@/types/blocknote";
import { EMPTY_BLOG_DOC } from "@/types/blocknote";
import type { BlogCategoryItem } from "@/lib/blog-categories";
import { BlogEditorToolbar } from "./BlogEditorToolbar";
import { BlogEditorCoverUpload } from "./BlogEditorCoverUpload";
import { useBlogEditorForm } from "./useBlogEditorForm";
import type { BlogEditorInitial } from "./editor-types";

export type { BlogEditorInitial } from "./editor-types";

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

type Props = {
  mode: "create" | "edit";
  categories: BlogCategoryItem[];
  initial?: BlogEditorInitial;
};

export function BlogEditorForm({ mode, categories, initial }: Props) {
  const form = useBlogEditorForm({ mode, categories, initial });

  return (
    <div className="flex h-[calc(100dvh-4rem)] max-h-[calc(100dvh-4rem)] flex-col gap-4 overflow-hidden lg:h-[calc(100dvh-5rem)] lg:max-h-[calc(100dvh-5rem)]">
      <BlogEditorToolbar
        mode={mode}
        hasPostId={Boolean(form.postId)}
        categories={categories}
        categoryId={form.categoryId}
        selectedCategoryName={form.selectedCategoryName}
        onCategoryChange={form.setCategoryId}
        pending={form.pending}
        onSaveDraft={() => void form.submit("DRAFT")}
        onPublish={() => void form.submit("PUBLISHED")}
        onDelete={() => void form.removePost()}
      />

      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-5 min-h-0 overflow-y-auto px-1 pb-6">
        <Input
          value={form.title}
          onChange={(e) => form.setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
          className="shrink-0 border-0 px-0 py-2 text-3xl font-semibold leading-tight shadow-none focus-visible:ring-0 min-h-[3.25rem] md:text-4xl"
          aria-label="제목"
        />

        <div className="shrink-0 space-y-1.5">
          <Label htmlFor="blog-excerpt">요약 (선택)</Label>
          <Textarea
            id="blog-excerpt"
            value={form.excerpt}
            onChange={(e) => form.setExcerpt(e.target.value)}
            placeholder="목록·검색 미리보기에 쓰일 짧은 요약"
            rows={2}
            className="resize-y bg-white"
          />
        </div>

        <BlogEditorCoverUpload
          coverImageUrl={form.coverImageUrl}
          onCoverImageCleared={() => form.setCoverImageUrl(null)}
          coverUploading={form.coverUploading}
          pending={form.pending}
          coverFileInputRef={form.coverFileInputRef}
          onCoverFileChange={form.handleCoverFileChange}
          coverUrlInput={form.coverUrlInput}
          onCoverUrlInputChange={form.setCoverUrlInput}
          onCoverUrlImport={form.handleCoverUrlImport}
        />

        {isBlockNoteContent(form.documentJson) ? (
          <div className="space-y-4 rounded-lg border border-amber-200 bg-amber-50/80 p-4">
            <p className="text-sm text-amber-950">
              이 글은 BlockNote 형식으로 저장되어 있습니다. 아래는 읽기 전용
              미리보기입니다. Tiptap 에디터로 새로 작성하려면 버튼을 누르세요.
              (공개 페이지에는 기존 본문이 그대로 표시됩니다.)
            </p>
            <BlockNoteReader blocks={form.documentJson} />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="bg-white"
              onClick={() => form.setDocumentJson(EMPTY_BLOG_DOC)}
            >
              Tiptap 에디터로 새로 작성
            </Button>
          </div>
        ) : (
          <div className="flex h-[min(55vh,40rem)] min-h-[24rem] shrink-0 flex-col">
            <TiptapEditor
              ref={form.editorRef}
              key={form.storageKey}
              storageKey={form.storageKey}
              className="h-full min-h-0"
              initialContent={form.documentJson}
              onChangeDocument={(doc: TiptapBlogContent) =>
                form.setDocumentJson(doc)
              }
              uploadFile={form.uploadFile}
              importRemoteImage={form.importRemoteImage}
              editable
            />
          </div>
        )}
      </div>
    </div>
  );
}
