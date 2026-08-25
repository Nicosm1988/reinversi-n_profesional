import { expect, test } from "@playwright/test";

const hasSupabasePublicConfig = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
);

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
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/Acompañamos\s+transiciones laborales/);
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
  await expect(page.getByRole("link", { name: /Reconocer mis anclas de carrera/i }).first()).toBeVisible();

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
  await page.goto("/transiciones-laborales/explorar-direccion");
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

test("career-anchor entry is accessible and authenticated answers expose labeled radio groups", async ({ page }) => {
  await page.goto("/test-anclas-de-carrera");

  await expect(page.getByRole("heading", {
    level: 1,
    name: "Las motivaciones detrás de tus decisiones profesionales",
  })).toBeVisible();

  await expect(
    page.getByRole("heading", { name: "Cómo recibe Senda tu resultado", exact: true }),
  ).toHaveCount(0);
  await expect(page.locator("#career-anchor-result-email-consent")).toHaveCount(0);
  await expect(page.locator(".career-quiz")).not.toContainText(
    /hola@universosenda\.com|tanisardella@gmail\.com/i,
  );

  const login = page.getByRole("link", { name: "Ingresar con Google para continuar" });
  if (!hasSupabasePublicConfig) {
    await expect(login).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Guardado no disponible por el momento", exact: true }),
    ).toBeDisabled();
    await expect(page.getByText(
      "No podemos verificar tu cuenta o tus resultados guardados en este momento. Probá nuevamente más tarde.",
      { exact: true },
    )).toBeVisible();
    await expect(page.locator("fieldset")).toHaveCount(0);
    return;
  }

  if (await login.count()) {
    await expect(login).toBeVisible();
    await expect(page.locator("fieldset")).toHaveCount(0);
    return;
  }

  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.getByRole("button", { name: /Empezar el test|Retomar en el enunciado/ }).click();

  const firstStatement = page.locator("fieldset").first();
  await expect(firstStatement).toBeVisible();
  await expect(firstStatement).not.toHaveAccessibleName("");

  const choices = firstStatement.getByRole("radio");
  await expect(choices).toHaveCount(6);
  await choices.nth(2).focus();
  await page.keyboard.press("Space");
  await expect(choices.nth(2)).toBeChecked();
});

test("reduced motion disables ambient effects", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/test-anclas-de-carrera");

  await expect(page.locator(".pointer-illumination")).toHaveCSS("display", "none");
  await expect(page.locator(".universe-field").first()).toHaveCSS("animation-name", "none");
  await expect.poll(() => page.evaluate(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
});

test("light and dark themes change the central surfaces of every page template", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("reinvencion_cookie_consent", "true");
    if (!window.localStorage.getItem("theme")) window.localStorage.setItem("theme", "light");
  });

  const templates = [
    { route: "/", selector: ".senda-home > section:nth-of-type(2)" },
    { route: "/transiciones-laborales/explorar-direccion", selector: "main .senda-editorial-card" },
    { route: "/brujulas", selector: "main .senda-editorial-card" },
    { route: "/encontrar-mi-recorrido", selector: ".initial-diagnostic-page" },
    { route: "/test-anclas-de-carrera", selector: ".career-quiz" },
    { route: "/laboratorio-narrativas-laborales-alternativas", selector: "main .senda-editorial-card" },
  ] as const;

  const readSurface = (selector: string) =>
    page.locator(selector).first().evaluate((element) => {
      const style = window.getComputedStyle(element);
      return [style.backgroundColor, style.backgroundImage, style.color, style.borderColor].join("|");
    });

  for (const template of templates) {
    await page.goto(template.route);
    await page.evaluate(() => window.localStorage.setItem("theme", "light"));
    await page.reload();
    await expect.poll(() => page.locator("html").getAttribute("class")).toContain("light");
    const lightSurface = await readSurface(template.selector);

    await page.getByRole("button", { name: "Activar modo oscuro" }).first().click();
    await expect.poll(() => page.locator("html").getAttribute("class")).toContain("dark");
    const darkSurface = await readSurface(template.selector);

    expect(darkSurface, `${template.route} central surface did not change`).not.toBe(lightSurface);
  }
});

test("core text and action colors keep WCAG AA contrast in both themes", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("reinvencion_cookie_consent", "true");
    if (!window.localStorage.getItem("theme")) window.localStorage.setItem("theme", "light");
  });
  await page.goto("/");

  const readRatios = () =>
    page.evaluate(() => {
      function rgb(value: string) {
        const channels = value.match(/[\d.]+/g)?.slice(0, 3).map(Number);
        if (!channels || channels.length !== 3) throw new Error(`Unsupported color: ${value}`);
        return channels.map((channel) => channel / 255);
      }

      function luminance(value: string) {
        return rgb(value)
          .map((channel) => channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
          .reduce((total, channel, index) => total + channel * [0.2126, 0.7152, 0.0722][index], 0);
      }

      function ratio(foreground: string, background: string) {
        const lighter = Math.max(luminance(foreground), luminance(background));
        const darker = Math.min(luminance(foreground), luminance(background));
        return (lighter + 0.05) / (darker + 0.05);
      }

      function computedPair(color: string, backgroundColor: string) {
        const probe = document.createElement("span");
        probe.style.color = color;
        probe.style.backgroundColor = backgroundColor;
        document.body.append(probe);
        const styles = window.getComputedStyle(probe);
        const values = { foreground: styles.color, background: styles.backgroundColor };
        probe.remove();
        return ratio(values.foreground, values.background);
      }

      return {
        primary: computedPair("var(--senda-ink)", "var(--senda-bg)"),
        muted: computedPair("var(--senda-muted)", "var(--senda-bg)"),
        action: computedPair("#ffffff", "var(--senda-action)"),
      };
    });

  for (const theme of ["light", "dark"] as const) {
    await page.evaluate((nextTheme) => window.localStorage.setItem("theme", nextTheme), theme);
    await page.reload();
    await expect.poll(() => page.locator("html").getAttribute("class")).toContain(theme);
    const ratios = await readRatios();
    expect(ratios.primary, `${theme} primary text`).toBeGreaterThanOrEqual(4.5);
    expect(ratios.muted, `${theme} muted text`).toBeGreaterThanOrEqual(4.5);
    expect(ratios.action, `${theme} action`).toBeGreaterThanOrEqual(4.5);
  }
});
