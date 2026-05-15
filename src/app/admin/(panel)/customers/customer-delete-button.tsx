"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deleteCustomer } from "./actions";

type CustomerDeleteButtonProps = {
  id: string;
  label: string;
  redirectToList?: boolean;
  className?: string;
};

export function CustomerDeleteButton({
  id,
  label,
  redirectToList = false,
  className,
}: CustomerDeleteButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    if (pending) return;

    const ok = window.confirm(`「${label}」 사용자를 삭제할까요?\n이 작업은 되돌릴 수 없습니다.`);
    if (!ok) return;

    setPending(true);
    try {
      const result = await deleteCustomer(id);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      if (redirectToList) {
        router.push("/admin/customers");
      }
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={(e) => void handleDelete(e)}
      disabled={pending}
      className={
        className ??
        "text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
      }
    >
      {pending ? "삭제 중…" : "삭제"}
    </button>
  );
}
