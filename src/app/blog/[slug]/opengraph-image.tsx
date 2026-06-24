import { prisma } from "@/lib/prisma";
import {
  createOgImageResponse,
  OG_CONTENT_TYPE,
  OG_SIZE,
} from "@/lib/og-image";

export const runtime = "nodejs";
export const alt = "CoreDXI 블로그";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

type PageProps = { params: Promise<{ slug: string }> };

export default async function OpenGraphImage({ params }: PageProps) {
  const { slug } = await params;
  const post = await prisma.blogPost.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: { title: true, excerpt: true },
  });

  return createOgImageResponse({
    badge: "블로그",
    title: post?.title ?? "CoreDXI 블로그",
    subtitle: post?.excerpt ?? "CoreDXI 소식·인사이트·고객 사례",
  });
}
