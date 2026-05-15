"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deletePortfolio } from "./actions";

type PortfolioDeleteButtonProps = {
  id: string;
  title: string;
};

export function PortfolioDeleteButton({ id, title }: PortfolioDeleteButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (pending) return;
    const ok = window.confirm(`「${title}」 성공사례를 삭제할까요?`);
    if (!ok) return;

    setPending(true);
    try {
      const result = await deletePortfolio(id);
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
    <button
      type="button"
      onClick={() => void handleDelete()}
      disabled={pending}
      className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
    >
      {pending ? "삭제 중…" : "삭제"}
    </button>
  );
}
