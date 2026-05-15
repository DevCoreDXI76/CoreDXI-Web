export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PortfolioDeleteButton } from "./portfolio-delete-button";

export default async function AdminPortfolioPage() {
  const items = await prisma.portfolio.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      clientName: true,
      metrics: true,
      createdAt: true,
    },
  });

  return (
    <div className="px-6 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">성공사례 관리</h1>
          <p className="mt-1 text-sm text-gray-500">
            총 {items.length}건의 성공사례가 등록되어 있습니다.
          </p>
        </div>
        <Link
          href="/admin/portfolio/new"
          className="inline-flex h-9 items-center justify-center rounded-xl bg-[#1E4E8C] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1E4E8C]/90"
        >
          새 성공사례 등록
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-12 text-center">#</TableHead>
              <TableHead>제목</TableHead>
              <TableHead>고객사</TableHead>
              <TableHead>성과 수치</TableHead>
              <TableHead className="text-right">등록일</TableHead>
              <TableHead className="w-36 text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-12 text-center text-gray-400"
                >
                  등록된 성공사례가 없습니다. 새 성공사례를 등록해 보세요.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="text-center text-sm text-gray-500">
                    {index + 1}
                  </TableCell>
                  <TableCell className="max-w-xs truncate font-medium text-gray-900">
                    {item.title}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {item.clientName}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm text-gray-600">
                    {item.metrics}
                  </TableCell>
                  <TableCell className="text-right text-sm text-gray-500">
                    {item.createdAt.toLocaleDateString("ko-KR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/portfolio/${item.id}/edit`}
                        className="text-sm font-medium text-[#1E4E8C] hover:underline"
                      >
                        수정
                      </Link>
                      <PortfolioDeleteButton id={item.id} title={item.title} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
