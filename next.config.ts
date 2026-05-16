import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prisma 7 + 드라이버 어댑터(pg): Vercel 서버리스에서 네이티브/엔진 모듈을 외부 패키지로 두어 런타임 오류 방지
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg"],
  transpilePackages: [
    "@blocknote/core",
    "@blocknote/react",
    "@blocknote/mantine",
  ],
};

export default nextConfig;
