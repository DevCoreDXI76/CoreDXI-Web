import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import authConfig from "./auth.config";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/generated/prisma/client";

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
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
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
        const accountType =
          "accountType" in user && user.accountType
            ? user.accountType
            : "user";
        token.accountType = accountType;

        if (accountType === "admin" && "role" in user && user.role) {
          token.role = user.role as Role;
        } else {
          token.role = undefined;
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.accountType = token.accountType as "user" | "admin";
        session.user.role = token.role as Role | undefined;
      }
      return session;
    },
  },
});
