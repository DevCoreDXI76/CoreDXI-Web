import { SITE_URL } from "@/lib/seo";

type BreadcrumbItem = {
  name: string;
  path: string;
};

/** Organization + WebSite 구조화 데이터 */
export function buildSiteJsonLd(): Record<string, unknown>[] {
  const organization = {
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
