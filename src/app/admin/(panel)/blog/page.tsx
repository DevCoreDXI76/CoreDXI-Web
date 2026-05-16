import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminBlogListPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      category: true,
      status: true,
      updatedAt: true,
      publishedAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">블로그</h1>
          <p className="mt-1 text-sm text-gray-500">
            노션형 에디터로 글을 작성하고 발행합니다.
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className={cn(buttonVariants({ variant: "default", size: "default" }))}
        >
          새 글
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-600">
            <tr>
              <th className="px-4 py-3">제목</th>
              <th className="px-4 py-3">카테고리</th>
              <th className="px-4 py-3">상태</th>
              <th className="px-4 py-3">수정일</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {posts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                  아직 글이 없습니다. 「새 글」로 시작하세요.
                </td>
              </tr>
            ) : (
              posts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/80">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {p.title}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.category}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        p.status === "PUBLISHED"
                          ? "rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800"
                          : "rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-900"
                      }
                    >
                      {p.status === "PUBLISHED" ? "발행" : "초안"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {p.updatedAt.toLocaleDateString("ko-KR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/blog/${p.id}/edit`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" })
                      )}
                    >
                      편집
                    </Link>
                    {p.status === "PUBLISHED" ? (
                      <Link
                        href={`/blog/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "sm" }),
                          "ml-1"
                        )}
                      >
                        보기
                      </Link>
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
