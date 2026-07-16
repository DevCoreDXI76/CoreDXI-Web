import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/api/",
        "/setup/",
        "/login",
        "/signup",
        "/concepts",
        "/sentry-example-page",
      ],
    },
    sitemap: "https://www.coredxi.com/sitemap.xml",
  };
}
