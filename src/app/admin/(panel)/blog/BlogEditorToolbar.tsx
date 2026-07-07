import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BlogCategoryItem } from "@/lib/blog-categories";

type Props = {
  mode: "create" | "edit";
  hasPostId: boolean;
  categories: BlogCategoryItem[];
  categoryId: string;
  selectedCategoryName: string | undefined;
  onCategoryChange: (id: string) => void;
  pending: boolean;
  onSaveDraft: () => void;
  onPublish: () => void;
  onDelete: () => void;
};

export function BlogEditorToolbar({
  mode,
  hasPostId,
  categories,
  categoryId,
  selectedCategoryName,
  onCategoryChange,
  pending,
  onSaveDraft,
  onPublish,
  onDelete,
}: Props) {
  return (
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
              if (v) onCategoryChange(v);
            }}
          >
            <SelectTrigger id="blog-category" className="w-[200px] bg-white">
              <SelectValue placeholder="주제">
                {selectedCategoryName}
              </SelectValue>
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
        {mode === "edit" && hasPostId ? (
          <Button
            type="button"
            variant="destructive"
            disabled={pending}
            onClick={onDelete}
          >
            삭제
          </Button>
        ) : null}
        <Button
          type="button"
          variant="secondary"
          disabled={pending}
          onClick={onSaveDraft}
        >
          임시저장
        </Button>
        <Button type="button" disabled={pending} onClick={onPublish}>
          발행하기
        </Button>
      </div>
    </div>
  );
}
