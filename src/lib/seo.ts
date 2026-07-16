import type { Metadata } from "next";

export const SITE_URL = "https://www.coredxi.com";

export const DEFAULT_OG_IMAGE = `${SITE_URL}/opengraph-image`;

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
  const ogImage = input.openGraph?.images ?? [{ url: DEFAULT_OG_IMAGE }];

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
      images: ogImage,
      ...input.openGraph,
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: ogImage.map((img) =>
        typeof img === "string" ? img : img.url
      ),
    },
  };
}

export const NOINDEX_METADATA: Metadata = {
  robots: { index: false, follow: false },
};
