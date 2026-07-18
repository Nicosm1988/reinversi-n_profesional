import { expect, test } from "@playwright/test";

test("Senda loads its visual identity, fonts and images", async ({ page }) => {
  const failedResources: string[] = [];
  page.on("requestfailed", (request) => {
    const isExpectedCancellation = request.failure()?.errorText === "net::ERR_ABORTED";
    const isLocalVercelTelemetry = request.url().includes("/_vercel/speed-insights/");
    if (!isExpectedCancellation && !isLocalVercelTelemetry) failedResources.push(request.url());
  });

  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);

  await expect(page).toHaveTitle(/Senda/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("próximo paso");
  await expect(page.locator('link[rel="icon"][href*="senda-mark.svg"]')).toHaveCount(1);

  const unloadedImages = await page.locator("img").evaluateAll((images) =>
    images
      .filter((image) => !(image as HTMLImageElement).complete || (image as HTMLImageElement).naturalWidth === 0)
      .map((image) => (image as HTMLImageElement).src),
  );

  expect(unloadedImages).toEqual([]);
  expect(failedResources).toEqual([]);
});

test("Senda remains readable on a narrow mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: /Entrar a la senda/i })).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(hasHorizontalOverflow).toBe(false);
});

test("theme control switches between light and dark modes", async ({ page }) => {
  await page.goto("/");

  const toggle = page.getByRole("button", { name: /Activar modo (oscuro|claro)/ }).first();
  await expect(toggle).toBeVisible();

  const initialTheme = await page.locator("html").getAttribute("class");
  await toggle.click();

  await expect
    .poll(async () => page.locator("html").getAttribute("class"))
    .not.toBe(initialTheme);
});
