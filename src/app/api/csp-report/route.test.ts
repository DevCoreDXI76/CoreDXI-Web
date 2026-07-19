import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@sentry/nextjs", () => ({
  captureMessage: vi.fn(),
}));

describe("POST /api/csp-report", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("logs a valid csp-report body to Sentry and returns 204", async () => {
    const Sentry = await import("@sentry/nextjs");
    const { POST } = await import("./route");

    const request = new Request("http://localhost/api/csp-report", {
      method: "POST",
      body: JSON.stringify({
        "csp-report": {
          "blocked-uri": "https://evil.example.com/x.js",
          "violated-directive": "script-src",
          "document-uri": "https://coredxi.com/",
        },
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(204);
    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      "CSP Violation",
      expect.objectContaining({ level: "warning" })
    );
  });

  it("returns 400 for an unparseable body", async () => {
    const { POST } = await import("./route");
    const request = new Request("http://localhost/api/csp-report", {
      method: "POST",
      body: "not json",
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });
});
