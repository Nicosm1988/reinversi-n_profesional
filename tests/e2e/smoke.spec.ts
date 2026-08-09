import { test, expect } from "@playwright/test";

test("smoke: landing, public intake and protected account routes are accessible", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Senda/i);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: /dirección para el cambio|direction for the change/i }).first()).toBeVisible();
  await expect(page.getByRole("heading", { level: 3, name: /orientación vocacional|vocational guidance/i })).toBeVisible();
  await expect(page.getByRole("heading", { level: 3, name: /reinvención profesional|professional reinvention/i })).toBeVisible();
  await expect(page.getByRole("heading", { level: 3, name: /transición laboral|career transition/i })).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  const bodyWidth = await page.locator("body").evaluate((element) => element.scrollWidth);
  expect(bodyWidth).toBeLessThanOrEqual(390);

  await page.goto("/diagnostico");
  await expect(page).toHaveURL(/\/diagnostico$/);
  await expect(page.getByRole("group", { name: /situación describe mejor|situation best describes/i })).toBeVisible();

  // The career anchor test is public: no login, captcha, or backend call
  // should be required to take it and see a result.
  await page.goto("/diagnostico/ancla-de-carrera/test");
  await expect(page).not.toHaveURL(/\/login/);
  await expect(page.getByText(/Preguntas 1 a 10|Questions 1 to 10/i)).toBeVisible();

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
