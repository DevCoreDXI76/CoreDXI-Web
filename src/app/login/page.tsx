/**
 * login/page.tsx — 로그인 페이지 (/login 경로)
 *
 * Loom.com 스타일의 깔끔한 로그인 화면입니다.
 * - 상단: CoreDXI 로고(좌) + 무료 회원가입 버튼(우)
 * - 중앙: 소셜 로그인 버튼 5개, OR 구분선, 이메일 입력, Continue 버튼
 * - 하단: 관리자 전용 이메일·비밀번호 로그인(NextAuth Credentials)
 * - Continue 버튼은 유효한 이메일이 입력되기 전까지 비활성화됩니다.
 *
 * ── 변경 이력 ──────────────────────────────────────────────────────
 * v0.3  2026-05-14  최초 온보딩(/setup) 안내 링크 추가
 * v0.2  2026-05-14  관리자 로그인 섹션 추가
 *       - 이메일+비밀번호 폼, 성공 시 /admin/users 이동, 실패 시 Toast
 * v0.1  2026-05-14  최초 생성
 *       - Loom 스타일 로그인 UI 구현
 *       - SOCIAL_PROVIDERS 배열로 소셜 버튼 관리
 *       - LOGIN_CONTENT 객체로 텍스트 중앙 관리
 *       - 이메일 유효성 검사 기반 Continue 버튼 활성화
 * ────────────────────────────────────────────────────────────────────
 *
 * [홍보팀 수정 안내]
 * ─────────────────────────────────────────────────────────────────
 * ✏️  텍스트 수정: 아래 LOGIN_CONTENT 객체의 값을 수정하세요.
 * 🔘  소셜 버튼 텍스트: SOCIAL_PROVIDERS 배열의 label 값을 수정하세요.
 * 🔗  회원가입 버튼 링크: LOGIN_CONTENT.signUpHref 값을 수정하세요.
 * ─────────────────────────────────────────────────────────────────
 */

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

/* =====================================================
   타입 정의
   ===================================================== */
interface SocialProvider {
  id: string;
  label: string;
  icon: React.FC<{ className?: string }>;
}

/* =====================================================
   [홍보팀] 콘텐츠 수정 구역 — 여기만 수정하면 됩니다!
   ===================================================== */

/**
 * [홍보팀] 로그인 페이지의 텍스트를 수정하는 곳입니다.
 */
const LOGIN_CONTENT = {
  /** [홍보팀] 페이지 중앙의 큰 제목입니다. */
  title: "Log in to CoreDXI",

  /** [홍보팀] 이메일 입력창의 라벨(설명)입니다. */
  emailLabel: "Work email",

  /** [홍보팀] 이메일 입력창 안에 흐릿하게 표시되는 예시 텍스트입니다. */
  emailPlaceholder: "name@company.com",

  /** [홍보팀] Continue 버튼의 텍스트입니다. */
  continueText: "Continue",

  /** [홍보팀] 우측 상단 회원가입 버튼의 텍스트입니다. */
  signUpText: "Sign up for free",

  /**
   * [홍보팀] 회원가입 버튼 클릭 시 이동할 링크입니다.
   * 예) "/signup" → 내부 회원가입 페이지
   */
  signUpHref: "/signup",

  /** [홍보팀] 이미 계정이 있다는 안내 문구입니다. */
  noAccountText: "Don't have an account?",

  /** [홍보팀] 관리자 로그인 구역 위 작은 구분 라벨입니다. */
  adminSectionLabel: "관리자 전용 로그인",

  /** [홍보팀] 관리자 이메일 입력 라벨입니다. */
  adminEmailLabel: "관리자 이메일",

  /** [홍보팀] 관리자 이메일 입력창 플레이스홀더입니다. */
  adminEmailPlaceholder: "admin@coredxi.com",

  /** [홍보팀] 관리자 비밀번호 입력 라벨입니다. */
  adminPasswordLabel: "비밀번호",

  /** [홍보팀] 관리자 비밀번호 입력창 플레이스홀더입니다. */
  adminPasswordPlaceholder: "비밀번호를 입력하세요",

  /** [홍보팀] 관리자 로그인 버튼 텍스트입니다. */
  adminSubmitText: "관리자 로그인",

  /** [홍보팀] 로그인 처리 중 버튼에 표시되는 텍스트입니다. */
  adminSubmittingText: "로그인 중…",

  /** 최초 온보딩(/setup) 링크 텍스트 */
  initialSetupLinkText: "최초 관리자 계정이 없나요? 시스템 설정",
} as const;

/* =====================================================
   소셜 로그인 아이콘 SVG 컴포넌트
   아이콘 모양을 변경하려면 개발팀에 문의하세요.
   ===================================================== */

/** Google 컬러 'G' 아이콘 */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

/** Slack '#' 로고 아이콘 */
function SlackIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52z" fill="#E01E5A" />
      <path d="M6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#E01E5A" />
      <path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834z" fill="#36C5F0" />
      <path d="M8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#36C5F0" />
      <path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834z" fill="#2EB67D" />
      <path d="M17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" fill="#2EB67D" />
      <path d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52z" fill="#ECB22E" />
      <path d="M15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#ECB22E" />
    </svg>
  );
}

/** Apple 로고 아이콘 */
function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

/** Microsoft Outlook 로고 아이콘 */
function OutlookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M7.88 12.04q0 .45-.11.87-.1.41-.33.74-.22.33-.58.52-.37.2-.87.2t-.85-.2q-.35-.21-.57-.55-.22-.33-.33-.75-.1-.42-.1-.86t.1-.87q.1-.43.34-.76.22-.34.59-.54.36-.2.87-.2t.86.2q.35.21.57.55.22.34.31.77.1.43.1.88zM24 12v9.38q0 .46-.33.8-.33.32-.8.32H7.13q-.46 0-.8-.33-.32-.33-.32-.8V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h6V2.55q0-.44.3-.75.3-.3.75-.3h12.9q.44 0 .75.3.3.3.3.75V9h.2q.4 0 .7.3.28.3.28.7v2zM7.97 9H1.5v6h6.47V9zM10.86 4.55v5.48l1.76-1.68 1.5 1.5 2.04-2.06-1.5-1.5 1.77-1.7-5.57-.04zm0 5.5v4.97l5.56.04-1.76-1.68 1.5-1.5-2.04-2.06-1.5 1.5-1.76-1.27zm9.14-5.5H14.6l5 4.78V4.55zm0 15h-9.14v-9.64l-4.03 3.85V19.5h13.17v-5z" fill="#0078D4" />
    </svg>
  );
}

/** SSO 키 아이콘 */
function SsoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="7.5" cy="15.5" r="5.5" />
      <path d="m21 2-9.6 9.6" />
      <path d="m15.5 7.5 3 3L22 7l-3-3" />
    </svg>
  );
}

/* =====================================================
   [홍보팀] 소셜 로그인 버튼 목록
   - label: 버튼에 표시되는 텍스트를 수정하세요.
   - 버튼 순서를 바꾸려면 줄 순서를 이동하세요.
   - 버튼 추가/삭제는 개발팀에 문의하세요.
   ===================================================== */
const SOCIAL_PROVIDERS = [
  {
    id: "google",
    label: "Continue with Google",
    icon: GoogleIcon,
  },
  {
    id: "slack",
    label: "Continue with Slack",
    icon: SlackIcon,
  },
  {
    id: "apple",
    label: "Continue with Apple",
    icon: AppleIcon,
  },
  {
    id: "outlook",
    label: "Continue with Outlook",
    icon: OutlookIcon,
  },
  {
    id: "sso",
    label: "Continue with SSO",
    icon: SsoIcon,
  },
] satisfies SocialProvider[];

/* =====================================================
   이 아래는 개발 코드입니다. 수정 시 개발팀에 문의하세요.
   ===================================================== */

/**
 * LoginPage 컴포넌트
 * /login 경로에서 렌더링되는 전체 로그인 페이지입니다.
 */
export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "Forbidden") {
      toast.error("관리자 전용 영역입니다. 관리자 계정으로 로그인해 주세요.");
      window.history.replaceState({}, "", "/login");
    }
  }, []);

  /* 이메일 입력 상태 */
  const [email, setEmail] = useState("");

  /* 관리자 로그인 폼 상태 */
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isAdminPending, setIsAdminPending] = useState(false);

  /* 이메일 유효성 검사: '@'와 '.'가 포함되어야 Continue 버튼 활성화 */
  const isValidEmail = email.includes("@") && email.includes(".");

  const isAdminEmailValid =
    adminEmail.includes("@") && adminEmail.includes(".");
  const isAdminFormValid =
    isAdminEmailValid && adminPassword.trim().length > 0;

  return (
    <div className="flex min-h-screen flex-col bg-white">

      {/* ─── 상단 미니 헤더 ─────────────────────────────────── */}
      <header className="flex items-center justify-between border-b border-border/40 px-6 py-4">

        {/* 로고 */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
          aria-label="CoreDXI 홈으로 이동"
        >
          {/* 기하학적 'C' SVG 로고 */}
          <svg width="30" height="30" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M28.5 10.5C26.2 6.8 22.1 4.5 17 4.5C9.5 4.5 3.5 10.5 3.5 17C3.5 23.5 9.5 29.5 17 29.5C22.1 29.5 26.2 27.2 28.5 23.5" stroke="#1E4E8C" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M24.5 12.5C23 10 20.2 8.5 17 8.5C11.7 8.5 7.5 12.5 7.5 17C7.5 21.5 11.7 25.5 17 25.5C20.2 25.5 23 24 24.5 21.5" stroke="#1E4E8C" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.5" fill="none" />
          </svg>
          <span className="text-lg font-bold text-primary tracking-tight">CoreDXI</span>
        </Link>

        {/* 회원가입 버튼 */}
        {/* [홍보팀] 회원가입 버튼 텍스트: LOGIN_CONTENT.signUpText 수정 */}
        {/* [홍보팀] 회원가입 버튼 링크: LOGIN_CONTENT.signUpHref 수정 */}
        <Link
          href={LOGIN_CONTENT.signUpHref}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-primary/20 transition-all hover:bg-primary/90 hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-primary"
        >
          {LOGIN_CONTENT.signUpText}
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
          </svg>
        </Link>
      </header>

      {/* ─── 메인 콘텐츠: 로그인 폼 ─────────────────────────── */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-6">

          {/* 페이지 제목 */}
          {/* [홍보팀] 큰 제목 텍스트: LOGIN_CONTENT.title 수정 */}
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {LOGIN_CONTENT.title}
          </h1>

          {/* ─── 소셜 로그인 버튼 5개 ──────────────────────── */}
          <div className="space-y-2.5">

            {/* [홍보팀] Google 로그인 버튼 — 텍스트: SOCIAL_PROVIDERS[0].label 수정 */}
            {/* [홍보팀] Slack 로그인 버튼 — 텍스트: SOCIAL_PROVIDERS[1].label 수정 */}
            {/* [홍보팀] Apple 로그인 버튼 — 텍스트: SOCIAL_PROVIDERS[2].label 수정 */}
            {/* [홍보팀] Microsoft Outlook 로그인 버튼 — 텍스트: SOCIAL_PROVIDERS[3].label 수정 */}
            {/* [홍보팀] SSO(기업 계정) 로그인 버튼 — 텍스트: SOCIAL_PROVIDERS[4].label 수정 */}
            {SOCIAL_PROVIDERS.map((provider) => (
              <button
                key={provider.id}
                type="button"
                onClick={() => {
                  /* [홍보팀] Google만 실제 로그인 연동됨. 문구는 SOCIAL_PROVIDERS의 label로 바꿀 수 있습니다. */
                  if (provider.id === "google") {
                    void signIn("google", { callbackUrl: "/" });
                  } else {
                    toast.info("준비 중입니다");
                  }
                }}
                className="flex w-full items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-foreground transition-all hover:bg-muted/50 hover:border-border/80 focus-visible:outline-2 focus-visible:outline-primary active:bg-muted"
                aria-label={provider.label}
              >
                <provider.icon className="h-5 w-5 shrink-0" />
                <span className="flex-1 text-center">{provider.label}</span>
              </button>
            ))}
          </div>

          {/* ─── OR 구분선 ─────────────────────────────────── */}
          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              OR
            </span>
            <Separator className="flex-1" />
          </div>

          {/* ─── 이메일 입력 폼 ────────────────────────────── */}
          <div className="space-y-3">

            {/* 이메일 라벨 + 입력창 */}
            <div className="space-y-1.5">
              {/* [홍보팀] 이메일 입력창 라벨: LOGIN_CONTENT.emailLabel 수정 */}
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                {LOGIN_CONTENT.emailLabel}
              </label>

              {/* [홍보팀] 이메일 입력창 플레이스홀더: LOGIN_CONTENT.emailPlaceholder 수정 */}
              <Input
                id="email"
                type="email"
                placeholder={LOGIN_CONTENT.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border-border bg-white focus-visible:ring-primary"
                autoComplete="email"
                autoFocus
              />
            </div>

            {/*
             * Continue 버튼
             * - 이메일 미입력 또는 형식 불일치: 회색(disabled)으로 비활성화
             * - 유효한 이메일 입력 시: 브랜드 컬러로 활성화
             * [홍보팀] 버튼 텍스트: LOGIN_CONTENT.continueText 수정
             */}
            <Button
              type="submit"
              disabled={!isValidEmail}
              className="w-full rounded-xl bg-primary font-semibold text-white shadow-sm shadow-primary/20 transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
              onClick={() => {
                if (isValidEmail) {
                  /* 추후 이메일 로그인(매직 링크) 또는 비밀번호 입력 단계 연동 예정 */
                  console.log(`이메일 로그인 시도: ${email}`);
                }
              }}
            >
              {LOGIN_CONTENT.continueText}
            </Button>
          </div>

          {/* ─── 관리자 전용 로그인 ───────────────────────────── */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs font-medium text-muted-foreground">
                {/* [홍보팀] 관리자 구역 제목: LOGIN_CONTENT.adminSectionLabel */}
                {LOGIN_CONTENT.adminSectionLabel}
              </span>
              <Separator className="flex-1" />
            </div>

            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!isAdminFormValid || isAdminPending) return;

                setIsAdminPending(true);
                try {
                  const result = await signIn("credentials", {
                    email: adminEmail,
                    password: adminPassword,
                    redirect: false,
                    callbackUrl: "/admin/users",
                  });
                  if (result?.error) {
                    toast.error(
                      "이메일 또는 비밀번호가 올바르지 않거나 관리자 권한이 없습니다."
                    );
                  } else {
                    toast.success("관리자로 로그인되었습니다.");
                    router.push("/admin/users");
                    router.refresh();
                  }
                } finally {
                  setIsAdminPending(false);
                }
              }}
            >
              <div className="space-y-1.5">
                {/* [홍보팀] 관리자 이메일 라벨: LOGIN_CONTENT.adminEmailLabel */}
                <Label htmlFor="admin-email" className="text-sm font-medium">
                  {LOGIN_CONTENT.adminEmailLabel}
                </Label>
                <Input
                  id="admin-email"
                  type="email"
                  autoComplete="username"
                  placeholder={LOGIN_CONTENT.adminEmailPlaceholder}
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  disabled={isAdminPending}
                  className="rounded-xl border-border bg-white focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                {/* [홍보팀] 비밀번호 라벨: LOGIN_CONTENT.adminPasswordLabel */}
                <Label htmlFor="admin-password" className="text-sm font-medium">
                  {LOGIN_CONTENT.adminPasswordLabel}
                </Label>
                <Input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder={LOGIN_CONTENT.adminPasswordPlaceholder}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  disabled={isAdminPending}
                  className="rounded-xl border-border bg-white focus-visible:ring-primary"
                />
              </div>

              {/* [홍보팀] 버튼 문구: LOGIN_CONTENT.adminSubmitText / adminSubmittingText */}
              <Button
                type="submit"
                disabled={!isAdminFormValid || isAdminPending}
                className="w-full rounded-xl bg-primary font-semibold text-white shadow-sm shadow-primary/20 transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isAdminPending
                  ? LOGIN_CONTENT.adminSubmittingText
                  : LOGIN_CONTENT.adminSubmitText}
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground">
              <Link
                href="/setup"
                className="font-medium text-primary hover:underline hover:underline-offset-4"
              >
                {LOGIN_CONTENT.initialSetupLinkText}
              </Link>
            </p>
          </div>

          {/* 계정 없음 안내 링크 */}
          {/* [홍보팀] 하단 회원가입 안내 문구: LOGIN_CONTENT.noAccountText 수정 */}
          <p className="text-center text-sm text-muted-foreground">
            {LOGIN_CONTENT.noAccountText}{" "}
            <Link
              href={LOGIN_CONTENT.signUpHref}
              className="font-medium text-primary hover:underline hover:underline-offset-4"
            >
              {LOGIN_CONTENT.signUpText}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
