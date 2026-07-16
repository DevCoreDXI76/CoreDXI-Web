import type { Metadata } from "next";

export const SITE_URL = "https://www.coredxi.com";

export const DEFAULT_OG_IMAGE = `${SITE_URL}/opengraph-image`;

export function siteUrl(path = ""): string {
  if (!path || path === "/") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function ogImageToUrl(
  img: string | URL | { url: string | URL }
): string | undefined {
  if (typeof img === "string") return img;
  if (img instanceof URL) return img.toString();
  const url = img.url;
  return typeof url === "string" ? url : url.toString();
}

export function pageMetadata(input: {
  title: string;
  description: string;
  path: string;
  openGraph?: Metadata["openGraph"];
}): Metadata {
  const canonical = siteUrl(input.path);
  const ogImages = input.openGraph?.images ?? [{ url: DEFAULT_OG_IMAGE }];
  const twitterImages = (Array.isArray(ogImages) ? ogImages : [ogImages])
    .map((img) => ogImageToUrl(img))
    .filter((url): url is string => Boolean(url));

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
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: twitterImages.length > 0 ? twitterImages : [DEFAULT_OG_IMAGE],
    },
  };
}

export const NOINDEX_METADATA: Metadata = {
  robots: { index: false, follow: false },
};
