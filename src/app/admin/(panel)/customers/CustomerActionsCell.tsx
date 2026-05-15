"use client";

import { TableCell } from "@/components/ui/table";

export function CustomerActionsCell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TableCell
      className="text-right"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {children}
    </TableCell>
  );
}
