import { expect, test } from "@playwright/test";

const routes = [
  "/contacto",
  "/diagnostico",
  "/diagnostico/ancla-de-carrera",
  "/diagnostico/ancla-de-carrera/test",
  "/procesos/brujula",
  "/procesos/nueva-etapa-profesional",
  "/quienes-somos",
  "/privacidad",
  "/terminos",
  "/login",
  "/panel",
];

const locales = [
  { prefix: "", themeToggle: /Activar modo (oscuro|claro)/ },
  { prefix: "/en", themeToggle: /Switch to (dark|light) mode/ },
] as const;

const legacyJourneyRedirects = [
  { source: "/orientacion-vocacional", destination: "/procesos/brujula" },
  { source: "/procesos/orientacion-vocacional", destination: "/procesos/brujula" },
  { source: "/procesos/reinvencion-profesional", destination: "/procesos/nueva-etapa-profesional" },
  { source: "/procesos/transicion-laboral", destination: "/procesos/nueva-etapa-profesional" },
] as const;

for (const locale of locales) {
  for (const route of routes) {
    const localizedRoute = `${locale.prefix}${route}`;

    test(`${localizedRoute} is readable in light and dark modes`, async ({ page }) => {
      const failedSameOriginResources: string[] = [];
      page.on("requestfailed", (request) => {
        const isExpectedCancellation = request.failure()?.errorText === "net::ERR_ABORTED";
        const isLocalVercelTelemetry = request.url().includes("/_vercel/speed-insights/");
        if (
          new URL(request.url()).hostname === "127.0.0.1"
          && !isExpectedCancellation
          && !isLocalVercelTelemetry
        ) {
          failedSameOriginResources.push(request.url());
        }
      });

      await page.addInitScript(() => {
        window.localStorage.setItem("theme", "light");
      });
      await page.goto(localizedRoute);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

      const toggle = page.getByRole("button", { name: locale.themeToggle }).first();
      await expect(toggle).toBeVisible();
      await toggle.click();
      await expect.poll(() => page.locator("html").getAttribute("class")).toContain("dark");

      const hasHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1,
      );
      expect(hasHorizontalOverflow).toBe(false);
      expect(failedSameOriginResources).toEqual([]);
    });
  }
}

for (const locale of locales) {
  for (const redirect of legacyJourneyRedirects) {
    const source = `${locale.prefix}${redirect.source}`;
    const destination = `${locale.prefix}${redirect.destination}`;

    test(`${source} permanently redirects to ${destination}`, async ({ page, request }) => {
      const response = await request.get(source, { maxRedirects: 0 });
      expect(response.status()).toBe(308);

      const location = response.headers().location;
      expect(location).toBeTruthy();
      expect(new URL(location, response.url()).pathname).toBe(destination);

      await page.goto(source);
      expect(new URL(page.url()).pathname).toBe(destination);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    });
  }
}

test("English navigation keeps the selected locale", async ({ page }) => {
  await page.goto("/en");

  const internalLinks = await page.locator('a[href^="/"]').evaluateAll((links) =>
    links.map((link) => {
      const url = new URL((link as HTMLAnchorElement).href);
      return {
        path: url.pathname,
        hrefLang: link.getAttribute("hreflang"),
      };
    }),
  );

  expect(
    internalLinks.filter(
      ({ path, hrefLang }) =>
        !hrefLang && path !== "/en" && !path.startsWith("/en/"),
    ),
  ).toEqual([]);
});

test("contact pages do not show a business-hours block", async ({ page }) => {
  for (const route of ["/contacto", "/en/contacto"]) {
    await page.goto(route);
    await expect(page.getByText(/Horario de atención|Monday through Friday, 9:00/i)).toHaveCount(0);
  }
});

test("initial diagnostic does not overflow on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const route of ["/diagnostico", "/en/diagnostico"]) {
    await page.goto(route);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  }
});
