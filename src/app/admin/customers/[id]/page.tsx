export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { formatSignupMethods, getSignupMethodLabels } from "../signup-method";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminCustomerDetailPage({ params }: PageProps) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      password: true,
      createdAt: true,
      updatedAt: true,
      accounts: { select: { provider: true } },
    },
  });

  if (!user) {
    notFound();
  }

  const signupLabels = getSignupMethodLabels(user);

  return (
    <div className="px-6 py-10">
      <Link
        href="/admin/customers"
        className="text-sm font-medium text-primary hover:underline"
      >
        ← 사용자 목록
      </Link>

      <div className="mt-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">사용자 상세</h1>
        <p className="mt-1 text-sm text-gray-500">{user.email}</p>
      </div>

      <section className="max-w-2xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
          기본 정보
        </h2>
        <dl className="space-y-4">
          <div>
            <dt className="text-sm text-gray-500">이름</dt>
            <dd className="mt-0.5 font-medium text-gray-900">
              {user.name ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">이메일</dt>
            <dd className="mt-0.5 text-gray-900">{user.email}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">이메일 인증</dt>
            <dd className="mt-0.5 text-gray-900">
              {user.emailVerified
                ? user.emailVerified.toLocaleString("ko-KR")
                : "미인증"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">가입 방식</dt>
            <dd className="mt-1 flex flex-wrap gap-1">
              {signupLabels.map((label) => (
                <Badge
                  key={label}
                  variant="outline"
                  className="text-xs font-medium bg-slate-100 text-slate-700 border-slate-200"
                >
                  {label}
                </Badge>
              ))}
            </dd>
            <p className="mt-1 text-xs text-gray-400">
              {formatSignupMethods(user)}
            </p>
          </div>
          <div>
            <dt className="text-sm text-gray-500">등록일</dt>
            <dd className="mt-0.5 text-gray-900">
              {user.createdAt.toLocaleString("ko-KR")}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">최종 수정</dt>
            <dd className="mt-0.5 text-gray-900">
              {user.updatedAt.toLocaleString("ko-KR")}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
