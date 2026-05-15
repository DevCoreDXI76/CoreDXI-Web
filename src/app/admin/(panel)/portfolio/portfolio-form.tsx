"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createPortfolio,
  updatePortfolio,
  type PortfolioFormData,
} from "./actions";

export type PortfolioFormValues = PortfolioFormData & { id?: string };

type PortfolioFormProps = {
  mode: "create" | "edit";
  initial?: PortfolioFormValues;
};

const emptyValues: PortfolioFormValues = {
  title: "",
  clientName: "",
  thumbnailUrl: "",
  videoUrl: "",
  content: "",
  metrics: "",
};

export function PortfolioForm({ mode, initial }: PortfolioFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [values, setValues] = useState<PortfolioFormValues>(
    initial ?? emptyValues
  );

  function updateField<K extends keyof PortfolioFormData>(
    key: K,
    value: PortfolioFormData[K]
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;

    setPending(true);
    try {
      const payload: PortfolioFormData = {
        title: values.title,
        clientName: values.clientName,
        thumbnailUrl: values.thumbnailUrl,
        videoUrl: values.videoUrl,
        content: values.content,
        metrics: values.metrics,
      };

      const result =
        mode === "edit" && values.id
          ? await updatePortfolio(values.id, payload)
          : await createPortfolio(payload);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.push("/admin/portfolio");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {mode === "create" ? "새 성공사례 등록" : "성공사례 수정"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          아래 항목을 입력한 뒤 저장하기를 누르세요.
        </p>
      </div>

      <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* [홍보팀] 성공사례 카드에 표시될 큰 제목입니다. */}
        <div className="space-y-1.5">
          <Label htmlFor="portfolio-title">제목</Label>
          <Input
            id="portfolio-title"
            value={values.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="예: 글로벌 제조사 A사 DX 전환"
            disabled={pending}
          />
        </div>

        {/* [홍보팀] 고객사 이름(로고 옆에 표시)입니다. */}
        <div className="space-y-1.5">
          <Label htmlFor="portfolio-client">고객사명</Label>
          <Input
            id="portfolio-client"
            value={values.clientName}
            onChange={(e) => updateField("clientName", e.target.value)}
            placeholder="예: (주)OO제조"
            disabled={pending}
          />
        </div>

        {/* [홍보팀] 성과 한 줄 요약 — 숫자·퍼센트를 넣으면 효과적입니다. */}
        <div className="space-y-1.5">
          <Label htmlFor="portfolio-metrics">성과 수치</Label>
          <Input
            id="portfolio-metrics"
            value={values.metrics}
            onChange={(e) => updateField("metrics", e.target.value)}
            placeholder='예: "업무 효율 30% 증대"'
            disabled={pending}
          />
        </div>

        {/* [홍보팀] 썸네일: 드래그 UI는 미리보기용이며, 실제 저장은 아래 URL 입력란 값이 사용됩니다. */}
        <div className="space-y-2">
          <Label>썸네일 이미지</Label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center transition-colors hover:border-[#1E4E8C] hover:bg-gray-100"
          >
            <Upload className="mb-3 h-10 w-10 text-gray-400" aria-hidden />
            <span className="text-sm font-medium text-gray-700">
              이미지를 드래그 앤 드롭하거나 클릭해서 업로드하세요
            </span>
            <span className="mt-1 text-xs text-gray-500">
              (현재는 UI만 제공됩니다. 아래 URL 입력란에 이미지 주소를 붙여넣어
              저장하세요.)
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={() => {
              toast.info(
                "파일 업로드 기능은 준비 중입니다. 이미지 URL 입력란을 이용해 주세요."
              );
            }}
          />
          <div className="space-y-1.5">
            <Label htmlFor="portfolio-thumbnail-url">이미지 URL</Label>
            <Input
              id="portfolio-thumbnail-url"
              value={values.thumbnailUrl}
              onChange={(e) => updateField("thumbnailUrl", e.target.value)}
              placeholder="https://... (Supabase·CDN 등에 올린 이미지 주소)"
              disabled={pending}
            />
          </div>
          {values.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={values.thumbnailUrl}
              alt="썸네일 미리보기"
              className="h-40 w-full rounded-lg border object-cover"
            />
          ) : null}
        </div>

        {/* [홍보팀] 유튜브·비메오 공유 링크를 붙여넣으세요. */}
        <div className="space-y-1.5">
          <Label htmlFor="portfolio-video">동영상 URL</Label>
          <Input
            id="portfolio-video"
            value={values.videoUrl}
            onChange={(e) => updateField("videoUrl", e.target.value)}
            placeholder="유튜브 또는 비메오 URL 입력"
            disabled={pending}
          />
        </div>

        {/* [홍보팀] 성공사례 상세 페이지 본문입니다. */}
        <div className="space-y-1.5">
          <Label htmlFor="portfolio-content">상세 내용</Label>
          <Textarea
            id="portfolio-content"
            value={values.content}
            onChange={(e) => updateField("content", e.target.value)}
            placeholder="프로젝트 배경, 솔루션, 성과를 자유롭게 작성하세요."
            className="min-h-48"
            disabled={pending}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-[#1E4E8C] font-semibold text-white hover:bg-[#1E4E8C]/90"
        >
          {pending ? "저장 중…" : "저장하기"}
        </Button>
        <Link
          href="/admin/portfolio"
          className="inline-flex h-9 items-center justify-center rounded-xl border border-input bg-background px-4 text-sm font-medium shadow-xs hover:bg-accent hover:text-accent-foreground"
        >
          취소
        </Link>
      </div>
    </form>
  );
}
