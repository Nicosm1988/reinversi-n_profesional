import { test, expect } from "@playwright/test";

test("smoke: landing is accessible and diagnostic requires login", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Senda/i);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: /próximo paso|next step/i }).first()).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  const bodyWidth = await page.locator("body").evaluate((element) => element.scrollWidth);
  expect(bodyWidth).toBeLessThanOrEqual(390);

  await page.goto("/diagnostico/ancla-de-carrera");
  await expect(page).toHaveURL(/\/login\?next=.*diagnostico%2Fancla-de-carrera/);
  await expect(page.getByRole("button", { name: /google/i })).toBeVisible();

  await page.goto("/panel");
  await expect(page).toHaveURL(/\/login\?next=%2Fpanel/);
});

test("technical discovery files are valid and public", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain("Sitemap:");

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  expect(await sitemap.text()).toContain("<urlset");

  const llms = await request.get("/llms.txt");
  expect(llms.ok()).toBe(true);
  expect(await llms.text()).toContain("Senda");
});
