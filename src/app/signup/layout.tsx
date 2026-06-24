import type { Metadata } from "next";
import { NOINDEX_METADATA } from "@/lib/seo";

export const metadata: Metadata = {
  ...NOINDEX_METADATA,
  title: "회원가입",
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
