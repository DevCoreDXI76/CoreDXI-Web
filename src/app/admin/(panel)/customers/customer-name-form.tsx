"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateCustomerName } from "./actions";

type CustomerNameFormProps = {
  userId: string;
  email: string;
  initialName: string;
};

export function CustomerNameForm({
  userId,
  email,
  initialName,
}: CustomerNameFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;

    setPending(true);
    try {
      const result = await updateCustomerName(userId, name);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.push(`/admin/customers/${userId}`);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">사용자 이름 수정</h1>
        <p className="mt-1 text-sm text-gray-500">{email}</p>
      </div>

      <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="space-y-1.5">
          <Label htmlFor="customer-email">이메일</Label>
          <Input
            id="customer-email"
            value={email}
            readOnly
            className="rounded-lg bg-gray-50"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="customer-name">이름</Label>
          <Input
            id="customer-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름을 입력하세요"
            className="rounded-lg"
            disabled={pending}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          type="submit"
          disabled={pending || !name.trim()}
          className="rounded-xl bg-[#1E4E8C] font-semibold text-white hover:bg-[#1E4E8C]/90"
        >
          {pending ? "저장 중…" : "저장하기"}
        </Button>
        <Link
          href={`/admin/customers/${userId}`}
          className="inline-flex h-9 items-center justify-center rounded-xl border border-input bg-background px-4 text-sm font-medium shadow-xs hover:bg-accent hover:text-accent-foreground"
        >
          취소
        </Link>
      </div>
    </form>
  );
}
