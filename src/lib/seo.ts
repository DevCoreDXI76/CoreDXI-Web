import type { Metadata } from "next";

export const SITE_URL = "https://www.coredxi.com";

export function siteUrl(path = ""): string {
  if (!path || path === "/") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function pageMetadata(input: {
  title: string;
  description: string;
  path: string;
  openGraph?: Metadata["openGraph"];
}): Metadata {
  const canonical = siteUrl(input.path);

  return {
    title: input.title,
    description: input.description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "ko_KR",
      siteName: "CoreDXI",
      title: input.title,
      description: input.description,
      url: canonical,
      ...input.openGraph,
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
    },
  };
}

export const NOINDEX_METADATA: Metadata = {
  robots: { index: false, follow: false },
};
