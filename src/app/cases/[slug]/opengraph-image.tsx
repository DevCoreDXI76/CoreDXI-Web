import { getPortfolioBySlugOrId } from "@/lib/portfolio";
import {
  createOgImageResponse,
  OG_CONTENT_TYPE,
  OG_SIZE,
} from "@/lib/og-image";

export const runtime = "nodejs";
export const alt = "CoreDXI 성공사례";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

type PageProps = { params: Promise<{ slug: string }> };

export default async function OpenGraphImage({ params }: PageProps) {
  const { slug: param } = await params;
  const item = await getPortfolioBySlugOrId(param);

  return createOgImageResponse({
    badge: "성공사례",
    title: item?.title ?? "CoreDXI 성공사례",
    subtitle: item
      ? `${item.clientName} · ${item.metrics}`
      : "CoreDXI와 함께한 AX 전환 성공사례",
  });
}
