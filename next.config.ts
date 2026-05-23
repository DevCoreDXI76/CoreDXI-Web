import type { NextConfig } from "next";

function supabaseImageHostname(): string | undefined {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return undefined;
  try {
    return new URL(url).hostname;
  } catch {
    return undefined;
  }
}

const supabaseHostname = supabaseImageHostname();

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      ...(supabaseHostname
        ? [{ protocol: "https" as const, hostname: supabaseHostname }]
        : []),
    ],
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "coredxi.com" }],
        destination: "https://www.coredxi.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
