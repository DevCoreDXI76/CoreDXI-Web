"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  createBlogCategory,
  deleteBlogCategory,
  updateBlogCategory,
} from "../category-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BlogCategoryItem } from "@/lib/blog-categories";

type Props = {
  categories: BlogCategoryItem[];
};

function OrderControls({
  index,
  total,
  sortOrder,
  onMove,
}: {
  index: number;
  total: number;
  sortOrder: number;
  onMove: (direction: "up" | "down") => void;
}) {
  return (
    <div className="flex items-center gap-0.5">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-gray-500"
        disabled={index === 0}
        aria-label="순서 위로"
        onClick={() => onMove("up")}
      >
        <ChevronUp className="h-4 w-4" />
      </Button>
      <span className="min-w-[1.25rem] text-center text-gray-500 tabular-nums">
        {sortOrder}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-gray-500"
        disabled={index === total - 1}
        aria-label="순서 아래로"
        onClick={() => onMove("down")}
      >
        <ChevronDown className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function BlogTopicsManager({ categories: initial }: Props) {
  const router = useRouter();
  const [mockTopics, setMockTopics] = useState<BlogCategoryItem[]>(initial);
  const [pending, setPending] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    setMockTopics(initial);
  }, [initial]);

  function moveTopic(index: number, direction: "up" | "down") {
    setMockTopics((prev) => {
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((item, i) => ({ ...item, sortOrder: i + 1 }));
    });
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    try {
      const result = await createBlogCategory({
        name,
        slug: slug || undefined,
        description,
      });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setName("");
      setSlug("");
      setDescription("");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  function startEdit(cat: BlogCategoryItem) {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditDescription(cat.description ?? "");
  }

  async function handleUpdate(id: string) {
    if (pending) return;
    setPending(true);
    try {
      const result = await updateBlogCategory(id, {
        name: editName,
        description: editDescription,
      });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setEditingId(null);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function handleDelete(id: string, label: string) {
    if (
      !confirm(
        `「${label}」 주제를 삭제할까요? 소속 글이 있으면 삭제할 수 없습니다.`
      )
    ) {
      return;
    }
    if (pending) return;
    setPending(true);
    try {
      const result = await deleteBlogCategory(id);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleCreate}
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4"
      >
        <h2 className="text-lg font-semibold text-gray-900">주제 추가</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="topic-name">주제 이름</Label>
            <Input
              id="topic-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 이벤트"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="topic-slug">URL SLUG</Label>
            <Input
              id="topic-slug"
              value={slug}
              onChange={(e) =>
                setSlug(e.target.value.replace(/[^a-z0-9-]/g, ""))
              }
              placeholder="예: company-news"
            />
            <p className="text-xs text-gray-500">
              영문 소문자와 하이픈(-)만 사용할 수 있습니다.
            </p>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="topic-desc">설명 (공개 페이지 상단)</Label>
            <Textarea
              id="topic-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="예: 온·오프라인 이벤트 소식을 알려드립니다."
              rows={2}
            />
          </div>
        </div>
        <Button type="submit" disabled={pending}>
          추가
        </Button>
      </form>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-600">
            <tr>
              <th className="px-4 py-3">이름</th>
              <th className="px-4 py-3">URL slug</th>
              <th className="px-4 py-3">설명</th>
              <th className="px-4 py-3">순서</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mockTopics.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                  등록된 주제가 없습니다.
                </td>
              </tr>
            ) : (
              mockTopics.map((cat, index) => (
                <tr key={cat.id} className="hover:bg-gray-50/80">
                  {editingId === cat.id ? (
                    <>
                      <td className="px-4 py-3" colSpan={3}>
                        <div className="space-y-2">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                          />
                          <Textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            rows={2}
                            placeholder="설명"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <OrderControls
                          index={index}
                          total={mockTopics.length}
                          sortOrder={cat.sortOrder}
                          onMove={(direction) => moveTopic(index, direction)}
                        />
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <Button
                          type="button"
                          size="sm"
                          disabled={pending}
                          onClick={() => void handleUpdate(cat.id)}
                        >
                          저장
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="ml-1"
                          onClick={() => setEditingId(null)}
                        >
                          취소
                        </Button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {cat.name}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">
                        {cat.slug}
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                        {cat.description ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <OrderControls
                          index={index}
                          total={mockTopics.length}
                          sortOrder={cat.sortOrder}
                          onMove={(direction) => moveTopic(index, direction)}
                        />
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => startEdit(cat)}
                        >
                          수정
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="ml-1 text-red-600 hover:text-red-700"
                          disabled={pending}
                          onClick={() => void handleDelete(cat.id, cat.name)}
                        >
                          삭제
                        </Button>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
