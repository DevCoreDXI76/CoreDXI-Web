import type { NextConfig } from "next";
import path from "path";

/** ProseMirror/TipTap 중복 번들 방지 — renderSpec RangeError 예방 */
function pkgDir(name: string) {
  return path.join(process.cwd(), "node_modules", name);
}

const editorAliases = {
  "@tiptap/core": pkgDir("@tiptap/core"),
  "@tiptap/pm": pkgDir("@tiptap/pm"),
  "@tiptap/react": pkgDir("@tiptap/react"),
  "prosemirror-model": pkgDir("prosemirror-model"),
  "prosemirror-state": pkgDir("prosemirror-state"),
  "prosemirror-view": pkgDir("prosemirror-view"),
  "prosemirror-transform": pkgDir("prosemirror-transform"),
};

const nextConfig: NextConfig = {
  // Prisma 7 + 드라이버 어댑터(pg): Vercel 서버리스에서 네이티브/엔진 모듈을 외부 패키지로 두어 런타임 오류 방지
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg"],
  transpilePackages: [
    "@blocknote/core",
    "@blocknote/react",
    "@blocknote/mantine",
  ],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        ...editorAliases,
      };
    }
    return config;
  },
  turbopack: {
    resolveAlias: editorAliases,
  },
};

export default nextConfig;
