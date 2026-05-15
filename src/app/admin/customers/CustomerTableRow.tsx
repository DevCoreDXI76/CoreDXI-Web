"use client";

import { useRouter } from "next/navigation";
import { TableRow } from "@/components/ui/table";

export function CustomerTableRow({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <TableRow
      className="cursor-pointer hover:bg-gray-50"
      onClick={() => router.push(href)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(href);
        }
      }}
      tabIndex={0}
      role="link"
    >
      {children}
    </TableRow>
  );
}
