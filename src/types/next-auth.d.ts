import type { DefaultSession } from "next-auth";
import type { Role } from "@/generated/prisma/client";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      accountType: "user" | "admin";
      role?: Role;
    };
  }

  interface User {
    accountType?: "user" | "admin";
    role?: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    accountType: "user" | "admin";
    role?: Role;
  }
}
