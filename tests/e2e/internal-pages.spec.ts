import { expect, test } from "@playwright/test";

const retiredPublicTerms =
  /orientación vocacional|vocational guidance|reinvención profesional|professional reinvention|transición laboral|career transition/i;

const targetRoutes = [
  { path: "/", active: { es: "Inicio", en: "Home" } },
  {
    path: "/recorridos",
    active: { es: "Recorridos", en: "Journeys" },
    journeyCards: 2,
  },
  {
    path: "/recorridos/brujula",
    active: { es: "Brújula", en: "Compass" },
    journeyMenu: true,
    stages: 6,
  },
  {
    path: "/recorridos/nueva-etapa-profesional",
    active: { es: "Nueva Etapa Profesional", en: "New Professional Stage" },
    journeyMenu: true,
    stages: 8,
  },
  {
    path: "/como-trabajamos",
    active: { es: "Cómo trabajamos", en: "How we work" },
    methodSteps: 4,
  },
  { path: "/equipo", active: { es: "Equipo", en: "Team" }, teamCards: 3 },
  {
    path: "/preguntas-frecuentes",
    active: { es: "Preguntas frecuentes", en: "Frequently asked questions" },
    questions: 7,
  },
  { path: "/contacto", active: { es: "Contacto", en: "Contact" } },
] as const;

const locales = [
  {
    id: "es",
    prefix: "",
    primaryNavigation: "Navegación principal",
    journeysMenu: "Abrir menú de recorridos",
    themeToggle: /Activar modo (oscuro|claro)/,
    whatsappLabel: "Contactar a Senda por WhatsApp",
  },
  {
    id: "en",
    prefix: "/en",
    primaryNavigation: "Primary navigation",
    journeysMenu: "Open journeys menu",
    themeToggle: /Switch to (dark|light) mode/,
    whatsappLabel: "Contact Senda on WhatsApp",
  },
] as const;

const legacyJourneyRedirects = [
  { source: "/orientacion-vocacional", destination: "/recorridos/brujula" },
  { source: "/procesos/orientacion-vocacional", destination: "/recorridos/brujula" },
  { source: "/procesos/reinvencion-profesional", destination: "/recorridos/nueva-etapa-profesional" },
  { source: "/procesos/transicion-laboral", destination: "/recorridos/nueva-etapa-profesional" },
  { source: "/procesos/brujula", destination: "/recorridos/brujula" },
  { source: "/procesos/nueva-etapa-profesional", destination: "/recorridos/nueva-etapa-profesional" },
  { source: "/quienes-somos", destination: "/equipo" },
] as const;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("reinvencion_cookie_consent", "true");
    if (!window.localStorage.getItem("theme")) window.localStorage.setItem("theme", "light");
  });
});

for (const locale of locales) {
  for (const route of targetRoutes) {
    const localizedRoute = route.path === "/" ? locale.prefix || "/" : `${locale.prefix}${route.path}`;

    test(`${localizedRoute} has localized metadata, active navigation, theme support and no overflow`, async ({ page }) => {
      const pageErrors: string[] = [];
      const failedSameOriginResources: string[] = [];
      page.on("pageerror", (error) => pageErrors.push(error.message));
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
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(localizedRoute);

      await expect(page).toHaveTitle(/Senda/);
      if (route.path !== "/") {
        expect(await page.title()).toContain(route.active[locale.id]);
      }
      await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.{20,}/);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.getByRole("link", { name: locale.whatsappLabel, exact: true })).toBeVisible();
      await expect(page.locator("main img")).toHaveCount(0);

      const publicText = await page.locator("main").innerText();
      expect(publicText).not.toMatch(retiredPublicTerms);
      expect(publicText).not.toMatch(/\b(?:1500|1800|USD)\b|US\$/i);

      const navigation = page.getByRole("navigation", { name: locale.primaryNavigation });
      if ("journeyMenu" in route) {
        await navigation.getByRole("button", { name: locale.journeysMenu }).click();
      }
      await expect(
        navigation.getByRole("link", { name: route.active[locale.id], exact: true }),
      ).toHaveAttribute("aria-current", "page");

      if ("stages" in route) {
        await expect(page.locator("main article ol > li")).toHaveCount(route.stages);
      }
      if ("journeyCards" in route) {
        await expect(page.locator("main article")).toHaveCount(route.journeyCards);
      }
      if ("methodSteps" in route) {
        await expect(page.locator("main ol > li")).toHaveCount(route.methodSteps);
      }
      if ("teamCards" in route) {
        await expect(page.locator("main article")).toHaveCount(route.teamCards);
      }
      if ("questions" in route) {
        await expect(page.locator("main details")).toHaveCount(route.questions);
      }

      const toggle = page.getByRole("button", { name: locale.themeToggle }).first();
      await toggle.click();
      await expect.poll(() => page.locator("html").getAttribute("class")).toContain("dark");

      const hasHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1,
      );
      expect(hasHorizontalOverflow).toBe(false);
      expect(pageErrors).toEqual([]);
      expect(failedSameOriginResources).toEqual([]);
    });
  }
}

for (const locale of locales) {
  test(`all eight ${locale.id.toUpperCase()} routes fit a narrow mobile viewport`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    for (const route of targetRoutes) {
      const localizedRoute = route.path === "/" ? locale.prefix || "/" : `${locale.prefix}${route.path}`;
      await page.goto(localizedRoute);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `${localizedRoute} has horizontal overflow`).toBeLessThanOrEqual(1);
    }
  });
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

test("desktop journeys dropdown opens from the keyboard, focuses its first route and closes with Escape", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/recorridos");

  const navigation = page.getByRole("navigation", { name: "Navegación principal" });
  const toggle = navigation.getByRole("button", { name: "Abrir menú de recorridos" });
  await toggle.focus();
  await page.keyboard.press("ArrowDown");

  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  const firstJourney = navigation.getByRole("link", { name: "Brújula", exact: true });
  await expect(firstJourney).toBeVisible();
  await expect(firstJourney).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(toggle).toBeFocused();
});

test("mobile menu is focus-managed, marks the current page and preserves locale on journey navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/equipo");

  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await expect(page.getByRole("button", { name: "Close menu", exact: true })).toHaveAttribute(
    "aria-expanded",
    "true",
  );

  const mobileNavigation = page.getByRole("navigation", { name: "Mobile navigation" });
  await expect(mobileNavigation.getByRole("link", { name: /Home$/ })).toBeFocused();
  await expect(mobileNavigation.getByRole("link", { name: /Team$/ })).toHaveAttribute(
    "aria-current",
    "page",
  );

  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Menu", exact: true })).toBeFocused();

  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await mobileNavigation.getByRole("button", { name: "Open journeys menu" }).click();
  await mobileNavigation.getByRole("link", { name: "Compass", exact: true }).click();

  await expect(page).toHaveURL(/\/en\/recorridos\/brujula$/);
  await expect(page.getByRole("heading", { level: 1, name: "Compass" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toHaveCount(0);
});

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
