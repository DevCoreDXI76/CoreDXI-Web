import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import authConfig from "./auth.config";
import { sharedAuthCallbacks } from "@/lib/auth/callbacks";
import {
  kakaoFallbackEmail,
  type KakaoProfile,
} from "@/lib/auth/kakao-profile";
import {
  naverFallbackEmail,
  type NaverProfile,
} from "@/lib/auth/naver-profile";
import {
  authUrl,
  normalizeSiteUrl,
  resolveAuthSecretForNextAuth,
} from "@/lib/auth-env";
import { prisma } from "@/lib/prisma";

const secret = resolveAuthSecretForNextAuth();

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  secret,
  adapter: PrismaAdapter(prisma),
  providers: [
    ...authConfig.providers,
    Credentials({
      id: "user-credentials",
      name: "고객 로그인",
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (!email || !password || typeof email !== "string") return null;

        const user = await prisma.user.findUnique({
          where: { email: email.trim() },
        });
        if (!user?.password) return null;

        const valid = await bcrypt.compare(String(password), user.password);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          accountType: "user" as const,
        };
      },
    }),
    Credentials({
      id: "admin-credentials",
      name: "관리자 로그인",
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (!email || !password || typeof email !== "string") return null;

        const admin = await prisma.admin.findUnique({
          where: { email: email.trim() },
        });
        if (!admin) return null;

        const valid = await bcrypt.compare(String(password), admin.password);
        if (!valid) return null;

        if (admin.role === "VIEWER") return null;

        return {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          accountType: "admin" as const,
          role: admin.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (
        !account?.provider ||
        account.provider === "user-credentials" ||
        account.provider === "admin-credentials"
      ) {
        return true;
      }

      if (!user.email?.trim()) {
        if (account.provider === "kakao") {
          const kakaoProfile =
            profile && typeof profile === "object" && "id" in profile
              ? (profile as unknown as KakaoProfile)
              : null;
          const kakaoId =
            kakaoProfile?.id ?? account.providerAccountId ?? user.id;
          const fromKakao = kakaoProfile?.kakao_account?.email?.trim();
          user.email = fromKakao || kakaoFallbackEmail(kakaoId);
        } else if (account.provider === "naver") {
          const naverProfile =
            profile &&
            typeof profile === "object" &&
            "response" in profile
              ? (profile as unknown as NaverProfile)
              : null;
          const naverId =
            naverProfile?.response?.id ??
            account.providerAccountId ??
            user.id;
          const fromNaver = naverProfile?.response?.email?.trim();
          user.email = fromNaver || naverFallbackEmail(naverId);
        } else if (account.providerAccountId) {
          user.email = `${account.provider}_${account.providerAccountId}@oauth.coredxi.com`;
        }
      }

      return true;
    },
    async redirect({ url, baseUrl }) {
      const site =
        normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) ??
        authUrl ??
        (() => {
          try {
            const base = new URL(baseUrl);
            const isLocal =
              base.hostname === "localhost" || base.hostname === "127.0.0.1";
            return isLocal ? base.origin : "https://www.coredxi.com";
          } catch {
            return "https://www.coredxi.com";
          }
        })();

      if (!url || url.startsWith("/")) {
        return `${site}${url?.startsWith("/") ? url : "/"}`;
      }

      try {
        const next = new URL(url);
        const allowedOrigin = new URL(site).origin;

        if (next.origin === allowedOrigin) {
          return url;
        }
        if (
          next.hostname === "coredxi.com" ||
          next.hostname === "www.coredxi.com"
        ) {
          return url;
        }
        try {
          if (next.origin === new URL(baseUrl).origin) {
            return url;
          }
        } catch {
          /* ignore invalid baseUrl */
        }
        if (next.hostname.endsWith(".vercel.app")) {
          return url;
        }
      } catch {
        /* invalid absolute url — fall through to site root */
      }

      return `${site}/`;
    },
    ...sharedAuthCallbacks,
  },
});
