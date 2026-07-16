import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CoreDXI",
    short_name: "CoreDXI",
    description:
      "B2B AX 전환 솔루션을 제공하는 AI 코어 파트너, CoreDXI.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1E4E8C",
    lang: "ko",
    icons: [
      {
        src: "/brand/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    id: SITE_URL,
  };
}
