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
  title: "CoreDXI — 비즈니스의 중심을 AI로 깨우다",
  description:
    "복잡한 협업은 심플하게, 변화는 단단하게. B2B 회의 예약 및 AX 전환 솔루션을 제공하는 당신의 AI 코어 파트너, CoreDXI.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/brand/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/brand/logo-icon.png", type: "image/png" }],
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
  return (
    /* lang="ko" — 화면 읽기 프로그램과 SEO를 위해 한국어로 설정 */
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          {children}
          <Toaster richColors position="top-center" />
        </AuthProvider>
      </body>
    </html>
  );
}
