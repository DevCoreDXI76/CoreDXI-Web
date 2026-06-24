/**
 * layout.tsx — 공통 레이아웃
 *
 * 모든 페이지에 공통으로 적용되는 HTML 구조, 폰트, 메타데이터를 정의합니다.
 *
 * [홍보팀 안내]
 * - 브라우저 탭 제목과 검색 엔진 설명은 아래 metadata 객체에서 수정하세요.
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/AuthProvider";
import { SITE_URL } from "@/lib/seo";

/* 구글 폰트: Geist (모던하고 가독성 높은 산세리프 폰트) */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/*
 * [홍보팀] 브라우저 탭과 검색 엔진에 표시되는 사이트 정보입니다.
 * title: 브라우저 탭에 표시되는 제목
 * description: 구글 검색 결과에 표시되는 설명 문구
 */
export const metadata: Metadata = {
  title: {
    default: "CoreDXI — 비즈니스의 중심을 AI로 깨우다",
    template: "%s | CoreDXI",
  },
  description:
    "복잡한 협업은 심플하게, 변화는 단단하게. B2B 회의 예약 및 AX 전환 솔루션을 제공하는 당신의 AI 코어 파트너, CoreDXI.",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: SITE_URL,
  },
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? {
        verification: {
          google: process.env.GOOGLE_SITE_VERIFICATION,
        },
      }
    : {}),
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: "CoreDXI",
    title: "CoreDXI — 비즈니스의 중심을 AI로 깨우다",
    description:
      "복잡한 협업은 심플하게, 변화는 단단하게. B2B AX 전환 솔루션을 제공하는 AI 코어 파트너, CoreDXI.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CoreDXI — 비즈니스의 중심을 AI로 깨우다",
    description:
      "복잡한 협업은 심플하게, 변화는 단단하게. B2B AX 전환 솔루션을 제공하는 AI 코어 파트너.",
  },
  icons: {
    icon: [
      {
        url: "/brand/favicon-32x32.png?v=2",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/brand/favicon-16x16.png?v=2",
        sizes: "16x16",
        type: "image/png",
      },
      { url: "/favicon.ico?v=2", sizes: "48x48", type: "image/x-icon" },
    ],
    shortcut: "/brand/favicon-32x32.png?v=2",
    apple: [{ url: "/apple-icon.png?v=2", type: "image/png" }],
  },
};

/**
 * 루트 레이아웃 컴포넌트
 * 모든 페이지를 감싸는 공통 HTML 구조입니다.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CoreDXI",
    url: SITE_URL,
    logo: `${SITE_URL}/brand/logo.png`,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "contact@coredxi.com",
      availableLanguage: "Korean",
    },
    sameAs: [],
  };

  return (
    /* lang="ko" — 화면 읽기 프로그램과 SEO를 위해 한국어로 설정 */
    <html lang="ko">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/brand/favicon-32x32.png?v=2"
        />
        <link rel="icon" href="/favicon.ico?v=2" sizes="any" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          {children}
          <Toaster richColors position="top-center" />
        </AuthProvider>
      </body>
    </html>
  );
}
