#!/usr/bin/env node
// 라이트/다크 두 테마로 지정한 라우트를 순회하며 콘솔 에러와 <html> 클래스,
// 스크린샷을 남긴다. 사전 조건: `npm run dev`로 개발 서버가
// http://localhost:3100 에서 실행 중이어야 한다.
// 사용법: node scripts/theme-check.mjs /route1 /route2 ...

import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = "http://localhost:3100";
const OUT_DIR = ".theme-check";
const routes = process.argv.slice(2);

if (routes.length === 0) {
  console.error("usage: node scripts/theme-check.mjs /route1 /route2 ...");
  process.exit(2);
}

mkdirSync(OUT_DIR, { recursive: true });

let hadError = false;
const browser = await chromium.launch({ headless: true });

for (const route of routes) {
  for (const theme of ["light", "dark"]) {
    const page = await browser.newPage();
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(String(err)));

    await page.goto(BASE + route, { waitUntil: "networkidle" });
    await page.evaluate((t) => localStorage.setItem("theme", t), theme);
    await page.reload({ waitUntil: "networkidle" });

    const htmlClass = await page.evaluate(() => document.documentElement.className);
    const isDarkApplied = htmlClass.includes("dark");
    if (theme === "dark" && !isDarkApplied) {
      console.error(`[FAIL] ${route} (${theme}): <html> missing "dark" class`);
      hadError = true;
    }
    if (theme === "light" && isDarkApplied) {
      console.error(`[FAIL] ${route} (${theme}): <html> unexpectedly has "dark" class`);
      hadError = true;
    }

    const safeName = route === "/" ? "home" : route.replace(/\//g, "_");
    await page.screenshot({
      path: `${OUT_DIR}/${safeName}-${theme}.png`,
      fullPage: true,
    });

    if (consoleErrors.length > 0) {
      console.error(`[FAIL] ${route} (${theme}): console errors:`, consoleErrors.slice(0, 5));
      hadError = true;
    } else {
      console.log(`[OK] ${route} (${theme})`);
    }

    await page.close();
  }
}

await browser.close();

if (hadError) {
  console.error("\ntheme-check: FAILED — see above");
  process.exit(1);
}
console.log("\ntheme-check: all routes passed in both themes");
