import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg"],
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
