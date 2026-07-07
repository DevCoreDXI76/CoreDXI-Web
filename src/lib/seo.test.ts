import { describe, expect, it } from "vitest";
import { NOINDEX_METADATA, pageMetadata, siteUrl, SITE_URL } from "./seo";

describe("siteUrl", () => {
  it("returns the bare site url for empty/root path", () => {
    expect(siteUrl()).toBe(SITE_URL);
    expect(siteUrl("/")).toBe(SITE_URL);
  });

  it("joins a path that already starts with /", () => {
    expect(siteUrl("/blog")).toBe(`${SITE_URL}/blog`);
  });

  it("adds a leading / for a path missing one", () => {
    expect(siteUrl("blog")).toBe(`${SITE_URL}/blog`);
  });
});

describe("pageMetadata", () => {
  it("builds canonical, openGraph, and twitter metadata", () => {
    const metadata = pageMetadata({
      title: "제목",
      description: "설명",
      path: "/about",
    });

    expect(metadata.alternates).toEqual({ canonical: `${SITE_URL}/about` });
    expect(metadata.openGraph).toMatchObject({
      type: "website",
      locale: "ko_KR",
      siteName: "CoreDXI",
      title: "제목",
      description: "설명",
      url: `${SITE_URL}/about`,
    });
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      title: "제목",
      description: "설명",
    });
  });

  it("lets caller override openGraph fields", () => {
    const metadata = pageMetadata({
      title: "제목",
      description: "설명",
      path: "/blog/my-post",
      openGraph: { type: "article" },
    });

    expect(metadata.openGraph).toMatchObject({ type: "article" });
  });
});

describe("NOINDEX_METADATA", () => {
  it("disables indexing and following", () => {
    expect(NOINDEX_METADATA.robots).toEqual({ index: false, follow: false });
  });
});
