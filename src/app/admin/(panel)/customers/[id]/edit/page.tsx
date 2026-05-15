import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CustomerNameForm } from "../../customer-name-form";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminCustomerEditPage({ params }: PageProps) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") {
    redirect("/admin/customers");
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true },
  });

  if (!user) notFound();

  return (
    <div className="px-6 py-10">
      <Link
        href={`/admin/customers/${user.id}`}
        className="text-sm font-medium text-[#1E4E8C] hover:underline"
      >
        ← 사용자 상세
      </Link>
      <div className="mt-6">
        <CustomerNameForm
          userId={user.id}
          email={user.email}
          initialName={user.name ?? ""}
        />
      </div>
    </div>
  );
}
