import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RefObject } from "react";

type Props = {
  coverImageUrl: string | null;
  onCoverImageCleared: () => void;
  coverUploading: boolean;
  pending: boolean;
  coverFileInputRef: RefObject<HTMLInputElement | null>;
  onCoverFileChange: (file: File | undefined) => void;
  coverUrlInput: string;
  onCoverUrlInputChange: (value: string) => void;
  onCoverUrlImport: () => void;
};

export function BlogEditorCoverUpload({
  coverImageUrl,
  onCoverImageCleared,
  coverUploading,
  pending,
  coverFileInputRef,
  onCoverFileChange,
  coverUrlInput,
  onCoverUrlInputChange,
  onCoverUrlImport,
}: Props) {
  return (
    <div className="shrink-0 space-y-3 rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label htmlFor="blog-cover-url">썸네일 (선택)</Label>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending || coverUploading}
            onClick={() => coverFileInputRef.current?.click()}
          >
            {coverUploading ? "업로드 중…" : "이미지 선택"}
          </Button>
          {coverImageUrl ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={pending || coverUploading}
              onClick={onCoverImageCleared}
            >
              삭제
            </Button>
          ) : null}
        </div>
      </div>
      <input
        ref={coverFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onCoverFileChange(e.target.files?.[0])}
      />
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          id="blog-cover-url"
          value={coverUrlInput}
          onChange={(e) => onCoverUrlInputChange(e.target.value)}
          placeholder="이미지 URL 붙여넣기 (선택)"
          disabled={pending || coverUploading}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onCoverUrlImport();
            }
          }}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="shrink-0"
          disabled={pending || coverUploading || !coverUrlInput.trim()}
          onClick={onCoverUrlImport}
        >
          URL 가져오기
        </Button>
      </div>
      {coverImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverImageUrl}
          alt="썸네일 미리보기"
          className="aspect-[16/10] w-full max-w-md rounded-lg border object-cover"
        />
      ) : (
        <p className="text-sm text-gray-500">
          목록 카드에 표시될 대표 이미지입니다. 미설정 시 기본 이미지가
          사용됩니다.
        </p>
      )}
    </div>
  );
}
