import { test, expect } from "@playwright/test";

test("smoke: landing and diagnostic route are accessible", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Reinvencion|Reinvention|Reinvenci/i);

  await page.goto("/diagnostico/ancla-de-carrera");
  await expect(page).toHaveURL(/diagnostico\/ancla-de-carrera/);
  await expect(page.getByRole("heading", { level: 2 })).toBeVisible();
});