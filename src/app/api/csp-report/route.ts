import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch (e) {
    console.error("[csp-report]", e);
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const report =
    body && typeof body === "object" && "csp-report" in body
      ? (body as Record<string, unknown>)["csp-report"]
      : body;

  Sentry.captureMessage("CSP Violation", {
    level: "warning",
    extra: { report },
  });

  return new NextResponse(null, { status: 204 });
}
