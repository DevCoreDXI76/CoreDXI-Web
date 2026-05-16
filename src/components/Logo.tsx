/**
 * CoreDXI 브랜드 로고 — public/brand/logo.png
 * 투명 PNG로 교체 시 동일 경로 파일만 덮어쓰면 됩니다.
 */
import Image from "next/image";
import Link from "next/link";

const LOGO_SRC = "/brand/logo.png";

export type LogoProps = {
  size?: number;
  showWordmark?: boolean;
  wordmark?: string;
  href?: string;
  className?: string;
  /** 관리자 파란 사이드바 등 어두운 배경 */
  variant?: "default" | "onDark";
  priority?: boolean;
  ariaLabel?: string;
  wordmarkClassName?: string;
};

export function Logo({
  size = 34,
  showWordmark = false,
  wordmark = "CoreDXI",
  href = "/",
  className = "",
  variant = "default",
  priority = false,
  ariaLabel = "CoreDXI 홈으로 이동",
  wordmarkClassName,
}: LogoProps) {
  const imageClass =
    variant === "onDark"
      ? "brightness-0 invert shrink-0"
      : "shrink-0";

  const content = (
    <>
      <Image
        src={LOGO_SRC}
        alt=""
        width={size}
        height={size}
        className={imageClass}
        priority={priority}
        aria-hidden
      />
      {showWordmark && (
        <span
          className={
            wordmarkClassName ??
            (variant === "onDark"
              ? "text-base font-bold tracking-tight text-white"
              : "text-xl font-bold text-primary tracking-tight group-hover:opacity-80 transition-opacity")
          }
        >
          {wordmark}
        </span>
      )}
    </>
  );

  const linkClass = [
    "flex items-center gap-2.5 shrink-0 group",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Link href={href} className={linkClass} aria-label={ariaLabel}>
      {content}
    </Link>
  );
}

/** Link 없이 로고 마크만 (관리자 레이아웃 등) */
export function LogoMark({
  size = 28,
  variant = "default",
  className = "",
}: Pick<LogoProps, "size" | "variant" | "className">) {
  const imageClass =
    variant === "onDark"
      ? "brightness-0 invert shrink-0"
      : "shrink-0";

  return (
    <Image
      src={LOGO_SRC}
      alt="CoreDXI"
      width={size}
      height={size}
      className={[imageClass, className].filter(Boolean).join(" ")}
      aria-hidden
    />
  );
}
