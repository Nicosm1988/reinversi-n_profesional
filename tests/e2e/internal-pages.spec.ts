import { expect, test } from "@playwright/test";

const retiredPublicTerms =
  /orientación vocacional|vocational guidance|reinvenci[oó]n|reinventarse|professional reinvention|reinvent yourself/i;

const targetRoutes = [
  { path: "/", active: { es: "Inicio", en: "Home" } },
  { path: "/sobre-mi", active: { es: "Quiénes somos", en: "Who we are" }, aboutCards: 0 },
  {
    path: "/transiciones-laborales",
    active: { es: "Transiciones laborales", en: "Career transitions" },
    serviceCards: 7,
  },
  {
    path: "/transiciones-laborales/explorar-direccion",
    active: { es: "Explorar una nueva dirección profesional", en: "Explore a new professional direction" },
    servicesMenu: true,
    stages: 7,
  },
  {
    path: "/transiciones-laborales/cambiar-empleo",
    active: { es: "Preparar un cambio de empleo", en: "Prepare for a job change" },
    servicesMenu: true,
    stages: 8,
  },
  {
    path: "/transiciones-laborales/proyecto-propio",
    active: { es: "Construir o reordenar un proyecto propio", en: "Build or reorganize your own project" },
    servicesMenu: true,
    stages: 9,
  },
  {
    path: "/transiciones-laborales/liderazgo-empresa",
    active: { es: "Pensar el liderazgo y la continuidad de una empresa", en: "Think through leadership and business continuity" },
    servicesMenu: true,
    stages: 9,
  },
  {
    path: "/transiciones-laborales/desafio-puntual",
    active: { es: "Abordar un desafío profesional puntual", en: "Address a focused professional challenge" },
    servicesMenu: true,
    stages: 6,
  },
  {
    path: "/transiciones-laborales/elegir-formacion",
    active: { es: "Elegir una formación para el próximo paso", en: "Choose learning for your next step" },
    servicesMenu: true,
    stages: 9,
  },
  {
    path: "/transiciones-laborales/transicion-a-otro-rol",
    active: { es: "Transición a otro rol", en: "Transition to another role" },
    servicesMenu: true,
    stages: 7,
  },
  {
    path: "/brujulas",
    active: { es: "Brújulas", en: "Compass" },
    servicesMenu: true,
    stages: 0,
  },
  {
    path: "/como-trabajamos",
    active: { es: "Cómo trabajamos", en: "How we work" },
    methodSteps: 4,
  },
  { path: "/equipo", title: { es: "Equipo", en: "Team" }, teamCards: 3 },
  {
    path: "/test-anclas-de-carrera",
    title: { es: "Test de Anclas de Carrera", en: "Career Anchors Test" },
  },
  {
    path: "/encontrar-mi-recorrido",
    title: { es: "Encontrar mi recorrido", en: "Find my path" },
  },
  {
    path: "/laboratorio-narrativas-laborales-alternativas",
    title: { es: "Laboratorio de Narrativas Laborales Alternativas", en: "Alternative Work Narratives Lab" },
  },
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
    servicesMenu: "Abrir menú de transiciones laborales",
    themeToggle: /Activar modo (oscuro|claro)/,
    whatsappLabel: "Contactar a Senda por WhatsApp",
  },
  {
    id: "en",
    prefix: "/en",
    primaryNavigation: "Primary navigation",
    servicesMenu: "Open career transitions menu",
    themeToggle: /Switch to (dark|light) mode/,
    whatsappLabel: "Contact Senda on WhatsApp",
  },
] as const;

const legacyRedirects = [
  { source: "/orientacion-vocacional", destination: "/brujulas" },
  { source: "/procesos/orientacion-vocacional", destination: "/brujulas" },
  { source: "/procesos/brujula", destination: "/brujulas" },
  { source: "/recorridos/brujula", destination: "/brujulas" },
  { source: "/procesos/reinvencion-profesional", destination: "/transiciones-laborales" },
  { source: "/procesos/transicion-laboral", destination: "/transiciones-laborales" },
  { source: "/procesos/nueva-etapa-profesional", destination: "/transiciones-laborales" },
  { source: "/recorridos/nueva-etapa-profesional", destination: "/transiciones-laborales" },
  { source: "/recorridos", destination: "/transiciones-laborales" },
  { source: "/diagnostico", destination: "/encontrar-mi-recorrido" },
  { source: "/diagnostico/ancla-de-carrera", destination: "/test-anclas-de-carrera" },
  { source: "/diagnostico/ancla-de-carrera/test", destination: "/test-anclas-de-carrera" },
  { source: "/laboratorio-nuevas-narrativas", destination: "/laboratorio-narrativas-laborales-alternativas" },
  { source: "/quienes-somos", destination: "/sobre-mi" },
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
      const consoleErrors: string[] = [];
      const failedSameOriginResources: string[] = [];
      page.on("pageerror", (error) => pageErrors.push(error.message));
      page.on("console", (message) => {
        const isLocalVercelTelemetry =
          message.location().url.includes("/_vercel/speed-insights/")
          || message.text().includes("/_vercel/speed-insights/");
        if (message.type() === "error" && !isLocalVercelTelemetry) consoleErrors.push(message.text());
      });
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
      await page.setViewportSize({ width: 1720, height: 900 });
      await page.goto(localizedRoute);

      await expect(page).toHaveTitle(/Senda/);
      if (route.path !== "/") {
        const titleText = "title" in route
          ? route.title[locale.id]
          : "active" in route
            ? route.active[locale.id]
            : "Senda";
        expect(await page.title()).toContain(titleText);
      }
      await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.{20,}/);
      const canonicalHref = await page.locator('link[rel="canonical"]').getAttribute("href");
      expect(canonicalHref).not.toBeNull();
      const canonicalPath = new URL(canonicalHref!, page.url()).pathname.replace(/\/$/, "") || "/";
      const expectedPath = localizedRoute.replace(/\/$/, "") || "/";
      expect(canonicalPath).toBe(expectedPath);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.getByRole("link", { name: locale.whatsappLabel, exact: true })).toBeVisible();
      await expect(page.locator("main img")).toHaveCount(route.path === "/sobre-mi" ? 3 : 0);

      const publicSurface = [
        await page.title(),
        await page.locator('meta[name="description"]').getAttribute("content"),
        await page.locator("main").innerText(),
      ].join("\n");
      expect(publicSurface).not.toMatch(retiredPublicTerms);
      expect(publicSurface).not.toMatch(/\b(?:1500|1800|USD)\b|US\$/i);

      const navigation = page.getByRole("navigation", { name: locale.primaryNavigation });
      if ("active" in route) {
        if ("servicesMenu" in route) {
          await navigation.getByRole("button", { name: locale.servicesMenu }).click();
        }
        await expect(
          navigation.getByRole("link", { name: route.active[locale.id], exact: true }),
        ).toHaveAttribute("aria-current", "page");
      }

      if ("stages" in route) {
        await expect(page.locator("main article ol > li")).toHaveCount(route.stages);
      }
      if ("serviceCards" in route) {
        await expect(page.locator("main article")).toHaveCount(route.serviceCards);
        await expect(page.locator('main a[href$="/brujulas"]')).toBeVisible();
      }
      if ("methodSteps" in route) {
        await expect(page.locator("main ol > li")).toHaveCount(route.methodSteps);
      }
      if ("teamCards" in route) {
        await expect(page.locator("main article")).toHaveCount(route.teamCards);
        await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
      }
      if ("aboutCards" in route) {
        await expect(page.locator("main ol > li")).toHaveCount(route.aboutCards);
        await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "index, follow");
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
      expect(consoleErrors).toEqual([]);
      expect(failedSameOriginResources).toEqual([]);
    });
  }
}

for (const locale of locales) {
  test(`all canonical ${locale.id.toUpperCase()} routes fit a narrow mobile viewport`, async ({ page }) => {
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
  test(`all ${locale.id.toUpperCase()} legacy routes permanently redirect to their canonical destinations`, async ({ page, request }) => {
    for (const redirect of legacyRedirects) {
      const source = `${locale.prefix}${redirect.source}`;
      const destination = `${locale.prefix}${redirect.destination}`;
      const response = await request.get(source, { maxRedirects: 0 });
      expect(response.status(), `${source} redirect status`).toBe(308);

      const location = response.headers().location;
      expect(location).toBeTruthy();
      expect(new URL(location!, response.url()).pathname, `${source} redirect target`).toBe(destination);
    }

    const browserSource = `${locale.prefix}/diagnostico`;
    const browserDestination = `${locale.prefix}/encontrar-mi-recorrido`;
    await page.goto(browserSource);
    expect(new URL(page.url()).pathname).toBe(browserDestination);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
}

test("desktop services dropdown opens from the keyboard, focuses its first route and closes with Escape", async ({ page }) => {
  await page.setViewportSize({ width: 1720, height: 900 });
  await page.goto("/transiciones-laborales");

  const navigation = page.getByRole("navigation", { name: "Navegación principal" });
  const toggle = navigation.getByRole("button", { name: "Abrir menú de transiciones laborales" });
  await toggle.focus();
  await page.keyboard.press("ArrowDown");

  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  const firstService = navigation.getByRole("link", { name: "Explorar una nueva dirección profesional", exact: true });
  await expect(firstService).toBeVisible();
  await expect(firstService).toBeFocused();
  const menuLinks = page.locator("#senda-services-menu a");
  await expect(menuLinks).toHaveCount(8);
  await expect(menuLinks.last()).toHaveAttribute("href", "/brujulas");
  await expect(page.locator('#senda-services-menu a[href*="laboratorio"]')).toHaveCount(0);

  await page.keyboard.press("Escape");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(toggle).toBeFocused();
});

for (const locale of locales) {
  test(`${locale.id.toUpperCase()} places Who we are between Home and Career transitions`, async ({ page }) => {
    await page.setViewportSize({ width: 1720, height: 900 });
    await page.goto(locale.prefix || "/");

    const labels = await page
      .getByRole("navigation", { name: locale.primaryNavigation })
      .locator(":scope > ul > li > a")
      .allTextContents();

    expect(labels.slice(0, 3).map((label) => label.trim())).toEqual(
      locale.id === "es"
        ? ["Inicio", "Quiénes somos", "Transiciones laborales"]
        : ["Home", "Who we are", "Career transitions"],
    );
  });
}

for (const locale of locales) {
  test(`${locale.id.toUpperCase()} header adapts across notebook and zoom-equivalent widths`, async ({ page }) => {
    await page.goto(`${locale.prefix}/sobre-mi` || "/sobre-mi");

    const viewports = [
      { width: 320, desktop: false, word: false, largeLogo: false },
      { width: 389, desktop: false, word: false, largeLogo: false },
      { width: 390, desktop: false, word: true, largeLogo: false },
      { width: 720, desktop: false, word: true, largeLogo: false },
      { width: 767, desktop: false, word: true, largeLogo: false },
      { width: 768, desktop: false, word: true, largeLogo: true },
      { width: 960, desktop: false, word: true, largeLogo: true },
      { width: 1152, desktop: false, word: true, largeLogo: true },
      { width: 1366, desktop: false, word: true, largeLogo: true },
      { width: 1440, desktop: false, word: true, largeLogo: true },
      { width: 1536, desktop: false, word: true, largeLogo: true },
      { width: 1599, desktop: false, word: true, largeLogo: true },
      { width: 1600, desktop: true, word: true, largeLogo: true },
      { width: 1720, desktop: true, word: true, largeLogo: true },
      { width: 1920, desktop: true, word: true, largeLogo: true },
    ] as const;

    for (const viewport of viewports) {
      const scale = viewport.width >= 1024 ? 1.09 : 1;
      await page.setViewportSize({ width: viewport.width, height: 844 });

      const layout = await page.evaluate((primaryNavigation) => {
        const row = document.querySelector<HTMLElement>("header > div");
        const desktopNavigation = document.querySelector<HTMLElement>(
          `header nav[aria-label="${primaryNavigation}"]`,
        );
        const menuButton = document.querySelector<HTMLElement>(
          'header button[aria-controls="senda-mobile-menu"]',
        );
        const logo = document.querySelector<HTMLElement>("header .senda-logo");
        const mark = document.querySelector<SVGElement>("header .senda-logo__mark");
        const wordWrap = document.querySelector<HTMLElement>("header .senda-logo__word-wrap");
        const word = document.querySelector<HTMLElement>("header .senda-logo__word");
        const trail = document.querySelector<SVGElement>("header .senda-logo__trail");

        if (!row || !desktopNavigation || !menuButton || !logo || !mark || !wordWrap || !word || !trail) {
          throw new Error("Header structure is incomplete");
        }

        const visibleChildren = Array.from(row.children)
          .filter((element): element is HTMLElement => (element as HTMLElement).offsetParent !== null)
          .map((element) => element.getBoundingClientRect());
        const orderedWithoutOverlap = visibleChildren.every(
          (rect, index) => index === 0 || rect.left >= visibleChildren[index - 1].right - 1,
        );
        const rowRect = row.getBoundingClientRect();
        const markRect = mark.getBoundingClientRect();
        const trailRect = trail.getBoundingClientRect();
        const navigationLabels = Array.from(
          desktopNavigation.querySelectorAll<HTMLElement>(":scope > ul > li > a"),
        );
        const navigationTextCenters = desktopNavigation.offsetParent === null
          ? []
          : navigationLabels.map((link) => {
              const textNode = Array.from(link.childNodes)
                .flatMap((node) =>
                  node.nodeType === Node.TEXT_NODE ? [node] : Array.from(node.childNodes),
                )
                .find((node) => node.textContent?.trim());
              if (!textNode) throw new Error("Navigation label is missing");
              const range = document.createRange();
              range.selectNodeContents(textNode);
              const rect = range.getBoundingClientRect();
              return (rect.top + rect.bottom) / 2;
            });

        return {
          documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          rowWithinViewport: rowRect.left >= -1 && rowRect.right <= window.innerWidth + 1,
          orderedWithoutOverlap,
          desktopNavigationVisible: desktopNavigation.offsetParent !== null,
          menuButtonVisible: menuButton.offsetParent !== null,
          wordVisible: wordWrap.offsetParent !== null,
          markHeight: markRect.height,
          wordFontSize: Number.parseFloat(window.getComputedStyle(word).fontSize),
          trailWidth: trailRect.width,
          trailHeight: trailRect.height,
          headerHeight: rowRect.height,
          navigationTextDelta: navigationTextCenters.length === 0
            ? 0
            : Math.max(...navigationTextCenters) - Math.min(...navigationTextCenters),
        };
      }, locale.primaryNavigation);

      expect(layout.documentOverflow, `${locale.id} ${viewport.width}px document overflow`).toBeLessThanOrEqual(1);
      expect(layout.rowWithinViewport, `${locale.id} ${viewport.width}px header bounds`).toBe(true);
      expect(layout.orderedWithoutOverlap, `${locale.id} ${viewport.width}px header overlap`).toBe(true);
      expect(layout.desktopNavigationVisible).toBe(viewport.desktop);
      expect(layout.menuButtonVisible).toBe(!viewport.desktop);
      expect(layout.wordVisible).toBe(viewport.word);
      expect(layout.markHeight).toBeGreaterThanOrEqual((viewport.largeLogo ? 79 : 63) * scale - 1);
      expect(layout.markHeight).toBeLessThanOrEqual((viewport.largeLogo ? 81 : 65) * scale + 1);
      expect(layout.wordFontSize).toBeCloseTo((viewport.largeLogo ? 52 : 34.4) * scale, 0);
      if (!viewport.word) {
        expect(layout.trailWidth).toBe(0);
        expect(layout.trailHeight).toBe(0);
      } else if (viewport.largeLogo) {
        expect(layout.trailWidth).toBeGreaterThanOrEqual(147 * scale - 1);
        expect(layout.trailWidth).toBeLessThanOrEqual(152 * scale + 1);
        expect(layout.trailHeight).toBeGreaterThanOrEqual(15 * scale - 1);
        expect(layout.trailHeight).toBeLessThanOrEqual(17 * scale + 1);
      } else {
        expect(layout.trailWidth).toBeGreaterThanOrEqual(96);
        expect(layout.trailWidth).toBeLessThanOrEqual(101);
        expect(layout.trailHeight).toBeGreaterThanOrEqual(11);
        expect(layout.trailHeight).toBeLessThanOrEqual(13);
      }
      expect(layout.headerHeight).toBe(88);
      expect(layout.navigationTextDelta).toBeLessThanOrEqual(1);
    }
  });
}

test("mobile menu is focus-managed, marks the current page and preserves locale on service navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/sobre-mi");

  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await expect(page.getByRole("button", { name: "Close menu", exact: true })).toHaveAttribute(
    "aria-expanded",
    "true",
  );

  const mobileNavigation = page.getByRole("navigation", { name: "Mobile navigation" });
  await expect(mobileNavigation.getByRole("link", { name: /Home$/ })).toBeFocused();
  await expect(mobileNavigation.getByRole("link", { name: /Who we are$/ })).toHaveAttribute(
    "aria-current",
    "page",
  );

  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Menu", exact: true })).toBeFocused();

  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await mobileNavigation.getByRole("button", { name: "Open career transitions menu" }).click();
  await mobileNavigation.getByRole("link", { name: "Compass", exact: true }).click();

  await expect(page).toHaveURL(/\/en\/brujulas$/);
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

test("public questionnaires do not overflow on mobile before answering", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const route of [
    "/encontrar-mi-recorrido",
    "/en/encontrar-mi-recorrido",
    "/test-anclas-de-carrera",
    "/en/test-anclas-de-carrera",
  ]) {
    await page.goto(route);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  }
});
