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
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/Encontrá una dirección|Find a direction/);
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
  await expect(page.getByRole("link", { name: /Realizá el diagnóstico|Take the diagnostic/i }).first()).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(hasHorizontalOverflow).toBe(false);
});

test("theme control switches between light and dark modes", async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem("reinvencion_cookie_consent", "true"));
  await page.goto("/");
  await page.evaluate(() => window.localStorage.setItem("theme", "light"));
  await page.reload();

  const readSurface = (selector: string) =>
    page.locator(selector).first().evaluate((element) => {
      const style = window.getComputedStyle(element);
      return {
        backgroundColor: style.backgroundColor,
        backgroundImage: style.backgroundImage,
        borderColor: style.borderColor,
        color: style.color,
      };
    });

  const toggle = page.getByRole("button", { name: /Activar modo (oscuro|claro)/ }).first();
  await expect(toggle).toBeVisible();

  const lightHero = await readSurface(".senda-home > .senda-night");
  const lightFooter = await readSurface("footer.senda-night");
  const initialTheme = await page.locator("html").getAttribute("class");
  await toggle.click();

  await expect
    .poll(async () => page.locator("html").getAttribute("class"))
    .not.toBe(initialTheme);

  const darkHero = await readSurface(".senda-home > .senda-night");
  const darkFooter = await readSurface("footer.senda-night");
  expect(darkHero.backgroundImage).not.toBe(lightHero.backgroundImage);
  expect(darkHero.color).not.toBe(lightHero.color);
  expect(darkFooter.backgroundImage).not.toBe(lightFooter.backgroundImage);
  expect(darkFooter.color).not.toBe(lightFooter.color);

  await page.reload();
  await expect.poll(() => page.locator("html").getAttribute("class")).toContain("dark");
  await expect(toggle).toHaveAttribute("data-state", "dark");
  await expect(toggle).toHaveAccessibleName("Activar modo claro");

  await page.goto("/contacto");
  const darkContactHero = await readSurface(".wati-page-hero");
  const darkContactCard = await readSurface("main .bg-background");
  await page.getByRole("button", { name: "Activar modo claro" }).first().click();
  await expect.poll(() => page.locator("html").getAttribute("class")).toContain("light");
  const lightContactHero = await readSurface(".wati-page-hero");
  const lightContactCard = await readSurface("main .bg-background");
  expect(lightContactHero.backgroundImage).not.toBe(darkContactHero.backgroundImage);
  expect(lightContactHero.color).not.toBe(darkContactHero.color);
  expect(lightContactCard.backgroundColor).not.toBe(darkContactCard.backgroundColor);
  expect(lightContactCard.color).not.toBe(darkContactCard.color);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/recorridos/brujula");
  const lightJourneyHero = await readSurface("main header.senda-night");
  const lightJourneyCard = await readSurface("main .senda-editorial-card");
  await page.getByRole("button", { name: "Activar modo oscuro" }).first().click();
  const darkJourneyHero = await readSurface("main header.senda-night");
  const darkJourneyCard = await readSurface("main .senda-editorial-card");
  expect(darkJourneyHero.backgroundImage).not.toBe(lightJourneyHero.backgroundImage);
  expect(darkJourneyHero.color).not.toBe(lightJourneyHero.color);
  expect(darkJourneyCard.backgroundColor).not.toBe(lightJourneyCard.backgroundColor);
  expect(darkJourneyCard.color).not.toBe(lightJourneyCard.color);
});

test("career-anchor answers expose labeled radio groups", async ({ page }) => {
  await page.goto("/diagnostico/ancla-de-carrera/test");

  const firstQuestion = page.locator("fieldset").first();
  await expect(firstQuestion).toBeVisible();
  await expect(firstQuestion).not.toHaveAccessibleName("");

  const choices = firstQuestion.getByRole("radio");
  await expect(choices).toHaveCount(6);
  await choices.nth(2).focus();
  await page.keyboard.press("Space");
  await expect(choices.nth(2)).toBeChecked();
});

test("reduced motion disables ambient effects", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/diagnostico/ancla-de-carrera/test");

  await expect(page.locator(".pointer-illumination")).toHaveCSS("display", "none");
  await expect(page.locator(".universe-field").first()).toHaveCSS("animation-name", "none");
  await expect.poll(() => page.evaluate(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
});
