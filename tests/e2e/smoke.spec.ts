import { test, expect } from "@playwright/test";

test("smoke: landing is accessible and diagnostic requires login", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Reinvencion|Reinvention|Reinvenci/i);

  await page.goto("/diagnostico/ancla-de-carrera");
  await expect(page).toHaveURL(/\/login\?next=.*diagnostico%2Fancla-de-carrera/);
  await expect(page.getByRole("button", { name: /google/i })).toBeVisible();
});
