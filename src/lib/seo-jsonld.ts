import { SITE_URL } from "@/lib/seo";

type BreadcrumbItem = {
  name: string;
  path: string;
};

function parseSameAsUrls(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((url) => url.trim())
    .filter((url) => url.startsWith("http"));
}

/** Organization + WebSite 구조화 데이터 */
export function buildSiteJsonLd(
  sameAsEnv = process.env.ORGANIZATION_SAME_AS_URLS
): Record<string, unknown>[] {
  const sameAs = parseSameAsUrls(sameAsEnv);

  const organization: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CoreDXI",
    url: SITE_URL,
    logo: `${SITE_URL}/brand/logo.png`,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "contact@coredxi.com",
      availableLanguage: "Korean",
    },
  };

  if (sameAs.length > 0) {
    organization.sameAs = sameAs;
  }

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "CoreDXI",
    url: SITE_URL,
    publisher: {
      "@type": "Organization",
      name: "CoreDXI",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/brand/logo.png`,
      },
    },
    inLanguage: "ko-KR",
  };

  return [organization, website];
}

/** 페이지 경로 기반 BreadcrumbList JSON-LD */
export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path.startsWith("/") ? item.path : `/${item.path}`}`,
    })),
  };
}
