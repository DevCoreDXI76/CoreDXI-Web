import { expect, test } from "@playwright/test";
import { loginAsAdmin, skipWithoutAdminCredentials } from "./helpers/admin-auth";

test("관리자 로그인 골든패스", async ({ page }) => {
  skipWithoutAdminCredentials(test);

  await loginAsAdmin(page);

  await expect(page).toHaveURL(/\/admin\//);
});

test("잘못된 비밀번호는 로그인에 실패한다", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("관리자 이메일").fill("nonexistent-admin@example.com");
  await page.getByLabel("비밀번호").fill("wrong-password");
  await page.getByRole("button", { name: "관리자 로그인" }).click();

  await expect(
    page.getByText("이메일 또는 비밀번호가 올바르지 않거나 관리자 권한이 없습니다.")
  ).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/login/);
});
