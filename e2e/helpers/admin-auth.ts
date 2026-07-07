import type { Page, TestType } from "@playwright/test";

/**
 * 관리자 로그인 E2E는 실제 관리자 계정이 필요하다. 로컬/CI에
 * E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD가 설정돼 있지 않으면
 * (계정을 만들어 커밋할 수는 없으므로) 테스트를 건너뛴다.
 */
export function getAdminCredentials(): { email: string; password: string } | null {
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;
  if (!email || !password) return null;
  return { email, password };
}

export function skipWithoutAdminCredentials(test: TestType<object, object>) {
  test.skip(
    !getAdminCredentials(),
    "E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD 환경변수가 없어 건너뜁니다."
  );
}

export async function loginAsAdmin(page: Page): Promise<void> {
  const credentials = getAdminCredentials();
  if (!credentials) {
    throw new Error("E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD가 설정되지 않았습니다.");
  }

  await page.goto("/admin/login");
  await page.getByLabel("관리자 이메일").fill(credentials.email);
  await page.getByLabel("비밀번호").fill(credentials.password);
  await page.getByRole("button", { name: "관리자 로그인" }).click();
  await page.waitForURL(/\/admin\//, { timeout: 10_000 });
}
