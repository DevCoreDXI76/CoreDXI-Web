/**
 * 프로덕션 SEO·CWV 라이브 점검 스크립트
 * 실행: npx tsx scripts/seo-live-check.ts
 */
const SITE = "https://www.coredxi.com";

type CheckResult = {
  name: string;
  ok: boolean;
  detail: string;
};

async function fetchStatus(url: string): Promise<{ status: number; body: string }> {
  const res = await fetch(url, { redirect: "follow" });
  const body = await res.text();
  return { status: res.status, body };
}

async function checkUrl(path: string, expectStatus = 200): Promise<CheckResult> {
  const url = `${SITE}${path}`;
  try {
    const { status, body } = await fetchStatus(url);
    const ok = status === expectStatus;
    return {
      name: path || "/",
      ok,
      detail: ok ? `HTTP ${status}` : `HTTP ${status} — ${body.slice(0, 120)}`,
    };
  } catch (e) {
    return {
      name: path || "/",
      ok: false,
      detail: e instanceof Error ? e.message : "fetch failed",
    };
  }
}

async function checkPageSpeed(): Promise<CheckResult> {
  const api = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(SITE)}&strategy=mobile&category=performance&category=seo`;
  try {
    const res = await fetch(api);
    if (!res.ok) {
      return { name: "PageSpeed (mobile)", ok: false, detail: `API HTTP ${res.status}` };
    }
    const data = (await res.json()) as {
      lighthouseResult?: {
        categories?: {
          performance?: { score?: number };
          seo?: { score?: number };
        };
      };
    };
    const perf = data.lighthouseResult?.categories?.performance?.score;
    const seo = data.lighthouseResult?.categories?.seo?.score;
    const perfPct = perf != null ? Math.round(perf * 100) : null;
    const seoPct = seo != null ? Math.round(seo * 100) : null;
    return {
      name: "PageSpeed (mobile)",
      ok: perfPct != null && seoPct != null,
      detail: `Performance ${perfPct ?? "N/A"}/100 · SEO ${seoPct ?? "N/A"}/100`,
    };
  } catch (e) {
    return {
      name: "PageSpeed (mobile)",
      ok: false,
      detail: e instanceof Error ? e.message : "API failed",
    };
  }
}

async function checkHtmlContains(
  path: string,
  needle: string,
  label: string
): Promise<CheckResult> {
  try {
    const { status, body } = await fetchStatus(`${SITE}${path}`);
    const ok = status === 200 && body.includes(needle);
    return {
      name: label,
      ok,
      detail: ok ? "found" : `missing or HTTP ${status}`,
    };
  } catch (e) {
    return {
      name: label,
      ok: false,
      detail: e instanceof Error ? e.message : "fetch failed",
    };
  }
}

async function main() {
  console.log(`\n=== CoreDXI SEO Live Check ===\n${SITE}\n`);

  const checks = await Promise.all([
    checkUrl("/robots.txt"),
    checkUrl("/sitemap.xml"),
    checkUrl("/llms.txt"),
    checkUrl("/"),
    checkUrl("/blog"),
    checkUrl("/contact"),
    checkHtmlContains("/", "application/ld+json", "Home JSON-LD"),
    checkHtmlContains("/blog", "application/ld+json", "Blog list reachable"),
    checkPageSpeed(),
  ]);

  let passed = 0;
  for (const c of checks) {
    const mark = c.ok ? "PASS" : "FAIL";
    console.log(`[${mark}] ${c.name}: ${c.detail}`);
    if (c.ok) passed += 1;
  }

  console.log(`\n결과: ${passed}/${checks.length} 통과\n`);
  if (passed < checks.length) process.exitCode = 1;
}

main();
