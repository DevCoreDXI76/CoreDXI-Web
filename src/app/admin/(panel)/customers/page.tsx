export const dynamic = "force-dynamic";

import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CustomerTableRow } from "./CustomerTableRow";
import { CustomerActionsCell } from "./CustomerActionsCell";
import { CustomerDeleteButton } from "./customer-delete-button";
import { getSignupMethodLabels } from "./signup-method";

export default async function AdminCustomersPage() {
  const session = await auth();
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      createdAt: true,
      accounts: { select: { provider: true } },
    },
  });

  return (
    <div className="px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">사용자 목록</h1>
        <p className="mt-1 text-sm text-gray-500">
          총 {users.length}명의 사용자가 등록되어 있습니다.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-12 text-center">#</TableHead>
              <TableHead>이름</TableHead>
              <TableHead>이메일</TableHead>
              <TableHead>가입 방식</TableHead>
              <TableHead className="text-right">등록일</TableHead>
              {isSuperAdmin ? (
                <TableHead className="w-36 text-right">작업</TableHead>
              ) : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isSuperAdmin ? 6 : 5}
                  className="py-12 text-center text-gray-400"
                >
                  등록된 사용자가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user, index) => (
                <CustomerTableRow
                  key={user.id}
                  href={`/admin/customers/${user.id}`}
                >
                  <TableCell className="text-center text-sm text-gray-500">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">
                    {user.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {getSignupMethodLabels(user).map((label) => (
                        <Badge
                          key={label}
                          variant="outline"
                          className="text-xs font-medium bg-slate-100 text-slate-700 border-slate-200"
                        >
                          {label}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-sm text-gray-500">
                    {user.createdAt.toLocaleDateString("ko-KR")}
                  </TableCell>
                  {isSuperAdmin ? (
                    <CustomerActionsCell>
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/customers/${user.id}/edit`}
                          className="text-sm font-medium text-[#1E4E8C] hover:underline"
                        >
                          수정
                        </Link>
                        <CustomerDeleteButton
                          id={user.id}
                          label={user.name ?? user.email}
                          redirectToList
                        />
                      </div>
                    </CustomerActionsCell>
                  ) : null}
                </CustomerTableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
