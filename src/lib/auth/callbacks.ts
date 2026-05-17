import type { NextAuthConfig } from "next-auth";
import type { Role } from "@/generated/prisma/client";

/** JWT·Session 공통 — auth.config(미들웨어)와 auth.ts(API)에서 동일하게 사용 */
export const jwtCallback: NonNullable<NextAuthConfig["callbacks"]>["jwt"] = ({
  token,
  user,
}) => {
  if (user?.id) {
    token.id = user.id;
    const accountType =
      "accountType" in user && user.accountType ? user.accountType : "user";
    token.accountType = accountType;

    if (accountType === "admin" && "role" in user && user.role) {
      token.role = user.role as Role;
    } else {
      token.role = undefined;
    }
  }
  return token;
};

export const sessionCallback: NonNullable<
  NextAuthConfig["callbacks"]
>["session"] = ({ session, token }) => {
  if (session.user) {
    session.user.id = token.id as string;
    session.user.accountType = token.accountType as "user" | "admin";
    session.user.role = token.role as Role | undefined;
  }
  return session;
};

export const sharedAuthCallbacks = {
  jwt: jwtCallback,
  session: sessionCallback,
} satisfies Pick<NonNullable<NextAuthConfig["callbacks"]>, "jwt" | "session">;
