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

  const website: Record<string, unknown> = {
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
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return [organization, website];
}

type FaqItem = {
  question: string;
  answer: string;
};

/** FAQPage 구조화 데이터 */
export function buildFaqJsonLd(items: FaqItem[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

/** 성공사례 상세 CaseStudy 구조화 데이터 */
export function buildCaseStudyJsonLd(input: {
  title: string;
  description: string;
  url: string;
  image: string;
  clientName: string;
  datePublished: string;
  dateModified: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": input.url,
    headline: input.title,
    description: input.description,
    image: input.image,
    url: input.url,
    datePublished: input.datePublished,
    dateModified: input.dateModified,
    author: {
      "@type": "Organization",
      name: "CoreDXI",
    },
    publisher: {
      "@type": "Organization",
      name: "CoreDXI",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/brand/logo.png`,
      },
    },
    about: {
      "@type": "Organization",
      name: input.clientName,
    },
    articleSection: "성공사례",
  };
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
