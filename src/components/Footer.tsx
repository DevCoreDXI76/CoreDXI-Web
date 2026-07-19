import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="text-lg font-bold tracking-tight text-foreground">
              CoreDXI
            </p>
            <p className="text-sm text-muted-foreground">
              © 2026 CoreDXI. All rights reserved.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-muted-foreground">
            <Link
              href="/terms"
              className="transition-colors duration-300 hover:text-foreground"
            >
              이용약관
            </Link>
            <Link
              href="/privacy"
              className="transition-colors duration-300 hover:text-foreground"
            >
              개인정보처리방침
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-primary transition-colors duration-300 hover:text-primary/80"
            >
              문의하기
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
