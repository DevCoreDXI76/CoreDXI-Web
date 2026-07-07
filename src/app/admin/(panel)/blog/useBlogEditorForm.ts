import { useRouter } from "next/navigation";
import { useId, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  importBlogImageFromUrl,
  uploadBlogImageFile,
} from "@/lib/blog-image-client";
import {
  countBrokenImages,
  stripUnpersistedImages,
} from "@/lib/tiptap-content";
import {
  normalizeBlogContent,
  type BlogPostContent,
  type TiptapBlogContent,
  isTiptapDocument,
} from "@/types/blocknote";
import type { TiptapEditorHandle } from "@/components/editor/TiptapEditor";
import { deleteBlogPost, saveBlogPost } from "./actions";
import type { BlogCategoryItem } from "@/lib/blog-categories";
import type { BlogEditorInitial } from "./editor-types";

type Props = {
  mode: "create" | "edit";
  categories: BlogCategoryItem[];
  initial?: BlogEditorInitial;
};

export function useBlogEditorForm({ mode, categories, initial }: Props) {
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
  const selectedCategoryName = useMemo(
    () => categories.find((c) => c.id === categoryId)?.name,
    [categories, categoryId]
  );
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(
    initial?.coverImageUrl ?? null
  );
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverUrlInput, setCoverUrlInput] = useState("");
  const [documentJson, setDocumentJson] = useState<BlogPostContent>(() =>
    normalizeBlogContent(initial?.content)
  );
  const [pending, setPending] = useState(false);
  const editorRef = useRef<TiptapEditorHandle>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  const storageKey = useMemo(
    () => postId ?? `new-${draftKey}`,
    [postId, draftKey]
  );

  const uploadPrefix = postId ?? draftKey;
  const coverUploadPrefix = `${uploadPrefix}/cover`;

  const uploadFile = useMemo(
    () => (file: File) => uploadBlogImageFile(file, uploadPrefix),
    [uploadPrefix]
  );

  const uploadCoverFile = useMemo(
    () => (file: File) => uploadBlogImageFile(file, coverUploadPrefix),
    [coverUploadPrefix]
  );

  const importRemoteImage = useMemo(
    () => (url: string) => importBlogImageFromUrl(url, uploadPrefix),
    [uploadPrefix]
  );

  const importCoverFromUrl = useMemo(
    () => (url: string) => importBlogImageFromUrl(url, coverUploadPrefix),
    [coverUploadPrefix]
  );

  async function handleCoverFileChange(file: File | undefined) {
    if (!file || coverUploading || pending) return;
    setCoverUploading(true);
    try {
      const url = await uploadCoverFile(file);
      setCoverImageUrl(url);
      toast.success("썸네일이 업로드되었습니다.");
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "썸네일 업로드에 실패했습니다."
      );
    } finally {
      setCoverUploading(false);
      if (coverFileInputRef.current) coverFileInputRef.current.value = "";
    }
  }

  async function handleCoverUrlImport() {
    const url = coverUrlInput.trim();
    if (!url || coverUploading || pending) return;
    setCoverUploading(true);
    try {
      const hosted = await importCoverFromUrl(url);
      setCoverImageUrl(hosted);
      setCoverUrlInput("");
      toast.success("썸네일이 등록되었습니다.");
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "썸네일을 가져오지 못했습니다."
      );
    } finally {
      setCoverUploading(false);
    }
  }

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
        coverImageUrl,
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

  return {
    postId,
    title,
    setTitle,
    categoryId,
    setCategoryId,
    selectedCategoryName,
    excerpt,
    setExcerpt,
    coverImageUrl,
    setCoverImageUrl,
    coverUploading,
    coverUrlInput,
    setCoverUrlInput,
    documentJson,
    setDocumentJson,
    pending,
    editorRef,
    coverFileInputRef,
    storageKey,
    uploadFile,
    importRemoteImage,
    handleCoverFileChange,
    handleCoverUrlImport,
    submit,
    removePost,
  };
}

export type { TiptapBlogContent };
