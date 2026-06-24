/**
 * src/app/admin/users/page.tsx — 관리자 목록 페이지 (/admin/users 경로)
 *
 * 등록된 모든 관리자를 테이블로 표시하고, 드롭다운으로 권한을 즉시 변경할 수 있습니다.
 *
 * [개발팀 안내]
 * - Server Component: prisma.user.findMany()로 데이터를 서버에서 직접 조회
 * - 권한 변경 Select는 RoleSelect(클라이언트 컴포넌트)로 분리
 * - shadcn/ui Table, Badge 컴포넌트 사용
 *
 * ── 변경 이력 ──────────────────────────────────────────────────────
 * v0.1  2026-05-14  최초 생성
 *       - prisma.user.findMany()로 전체 관리자 목록 조회
 *       - RoleSelect 클라이언트 컴포넌트로 즉시 권한 변경
 *       - 권한별 배지 색상 차별화 (SUPER_ADMIN: 파랑, EDITOR: 노랑, VIEWER: 회색)
 * ────────────────────────────────────────────────────────────────────
 */

// 관리자 페이지는 실시간 데이터가 필요하므로 정적 생성을 비활성화합니다.
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
import { Badge } from "@/components/ui/badge";
import { RoleSelect } from "./RoleSelect";
import { Role } from "@/generated/prisma/client";
import { formatKstDate } from "@/lib/format-kst-date";

// 권한별 Badge 스타일 정의
function RoleBadge({ role }: { role: Role }) {
  const styles: Record<Role, string> = {
    SUPER_ADMIN: "bg-blue-100 text-blue-800 border-blue-200",
    EDITOR: "bg-amber-100 text-amber-800 border-amber-200",
    VIEWER: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <Badge
      variant="outline"
      className={`text-xs font-medium ${styles[role]}`}
    >
      {role}
    </Badge>
  );
}

export default async function AdminUsersPage() {
  // 관리자 목록 조회 (생성일 오래된 순)
  const users = await prisma.admin.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return (
    <div className="px-6 py-10">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">관리자 목록</h1>
          <p className="mt-1 text-sm text-gray-500">
            총 {users.length}명의 관리자가 등록되어 있습니다.
          </p>
        </div>
        {/* 새 관리자 등록 버튼 */}
        <Link
          href="/admin/register"
          className="inline-flex items-center justify-center rounded-lg px-3 h-8 text-sm font-medium text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: "#1E4E8C" }}
        >
          + 새 관리자 등록
        </Link>
      </div>

      {/* 관리자 목록 테이블 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-12 text-center">#</TableHead>
              <TableHead>이름</TableHead>
              <TableHead>이메일</TableHead>
              <TableHead>현재 권한</TableHead>
              <TableHead>권한 변경</TableHead>
              <TableHead className="text-right">등록일</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              // 등록된 관리자가 없을 때 빈 상태 메시지
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-12 text-gray-400"
                >
                  등록된 관리자가 없습니다.{" "}
                  <Link
                    href="/admin/register"
                    className="underline text-blue-600 hover:text-blue-800"
                  >
                    새 관리자를 등록하세요
                  </Link>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user, index) => (
                <TableRow key={user.id} className="hover:bg-gray-50">
                  {/* 순번 */}
                  <TableCell className="text-center text-gray-500 text-sm">
                    {index + 1}
                  </TableCell>

                  {/* 이름 */}
                  <TableCell className="font-medium text-gray-900">
                    {user.name ?? "—"}
                  </TableCell>

                  {/* 이메일 */}
                  <TableCell className="text-gray-600 text-sm">
                    {user.email}
                  </TableCell>

                  {/* 현재 권한 배지 */}
                  <TableCell>
                    <RoleBadge role={user.role} />
                  </TableCell>

                  {/* 권한 변경 드롭다운 */}
                  <TableCell>
                    {/* [홍보팀/개발팀] 이 드롭다운으로 즉시 권한을 변경할 수 있습니다. */}
                    <RoleSelect userId={user.id} currentRole={user.role} />
                  </TableCell>

                  {/* 등록일 */}
                  <TableCell className="text-right text-gray-500 text-sm">
                    {formatKstDate(user.createdAt)}
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
