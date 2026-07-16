import { describe, expect, it } from "vitest";
import {
  buildCaseStudyJsonLd,
  buildFaqJsonLd,
  buildSiteJsonLd,
} from "./seo-jsonld";
import { SITE_URL } from "./seo";

describe("buildSiteJsonLd", () => {
  it("includes SearchAction for blog search", () => {
    const schemas = buildSiteJsonLd("");
    const website = schemas.find((s) => s["@type"] === "WebSite");
    expect(website).toMatchObject({
      potentialAction: {
        "@type": "SearchAction",
        target: {
          urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
        },
      },
    });
  });

  it("omits sameAs when env is empty", () => {
    const schemas = buildSiteJsonLd("");
    const org = schemas.find((s) => s["@type"] === "Organization");
    expect(org).not.toHaveProperty("sameAs");
  });
});

describe("buildFaqJsonLd", () => {
  it("maps FAQ items to FAQPage schema", () => {
    const json = buildFaqJsonLd([
      { question: "Q1", answer: "A1" },
    ]);
    expect(json).toMatchObject({
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Q1",
          acceptedAnswer: { "@type": "Answer", text: "A1" },
        },
      ],
    });
  });
});

describe("buildCaseStudyJsonLd", () => {
  it("builds Article schema for case studies", () => {
    const json = buildCaseStudyJsonLd({
      title: "사례",
      description: "고객 · 성과",
      url: `${SITE_URL}/cases/demo`,
      image: `${SITE_URL}/img.png`,
      clientName: "고객",
      datePublished: "2026-01-01T00:00:00.000Z",
      dateModified: "2026-02-01T00:00:00.000Z",
    });
    expect(json).toMatchObject({
      "@type": "Article",
      headline: "사례",
      articleSection: "성공사례",
    });
  });
});
