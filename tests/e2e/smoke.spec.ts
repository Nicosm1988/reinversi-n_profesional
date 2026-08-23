import { expect, test } from "@playwright/test";

const whatsappMessage =
  "Hola, estuve recorriendo la web de Senda y quisiera recibir más información.";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("reinvencion_cookie_consent", "true");
    if (!window.localStorage.getItem("theme")) window.localStorage.setItem("theme", "light");
  });
});

test("smoke: multipage gateway, public intake and protected account routes are accessible", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Senda/i);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/Acompañamos\s+transiciones laborales/);
  await expect(page.locator('main a[href="/transiciones-laborales"]').first()).toBeVisible();
  await expect(page.locator('main a[href="/test-anclas-de-carrera"]').first()).toBeVisible();

  await page.goto("/encontrar-mi-recorrido");
  await expect(page).toHaveURL(/\/encontrar-mi-recorrido$/);
  await expect(page.getByRole("group", { name: /situación describe mejor|situation best describes/i })).toBeVisible();

  // The career anchor test is public: no login, captcha, or backend call
  // should be required to take it and see a result.
  await page.goto("/test-anclas-de-carrera");
  await expect(page).not.toHaveURL(/\/login/);
  await expect(
    page.getByText(/Respondé las 40 afirmaciones a tu ritmo|Answer all 40 statements at your own pace/i),
  ).toBeVisible();

  await page.goto("/panel");
  await expect(page).toHaveURL(/\/login\?next=%2Fpanel/);
});

test("logo links home and exposes both slow orbits and the live trail", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/sobre-mi");

  const homeLink = page.getByRole("banner").getByRole("link", { name: "Ir al inicio de Senda" });
  await expect(homeLink).toHaveAttribute("href", "/");
  await expect(homeLink.locator(".senda-logo__mark")).toBeVisible();
  await expect(homeLink.locator(".senda-logo__orbit")).toHaveCount(2);
  await expect(homeLink.locator(".senda-logo__trail path")).toHaveCount(1);
  await expect(homeLink.locator(".senda-logo__orbit--one")).toHaveCSS(
    "animation-name",
    "senda-orbit-clockwise",
  );
  await expect(homeLink.locator(".senda-logo__orbit--two")).toHaveCSS(
    "animation-name",
    "senda-orbit-counterclockwise",
  );
  await expect(homeLink.locator(".senda-logo__trail path")).toHaveCSS(
    "animation-name",
    "senda-trail-draw",
  );

  const logoGeometry = await homeLink.locator(".senda-logo").evaluate(async (logo) => {
    await document.fonts.ready;
    const mark = logo.querySelector<SVGElement>(".senda-logo__mark");
    const word = logo.querySelector<HTMLElement>(".senda-logo__word");
    const path = logo.querySelector<SVGPathElement>(".senda-logo__trail path");
    const firstCharacter = word?.firstChild;
    if (!mark || !word || !path || !firstCharacter) throw new Error("Incomplete Senda logo");

    const range = document.createRange();
    range.setStart(firstCharacter, 0);
    range.setEnd(firstCharacter, 1);
    const sRect = range.getBoundingClientRect();
    const matrix = path.getScreenCTM();
    if (!matrix) throw new Error("The Senda trail has no screen transform");
    const trailStart = new DOMPoint(path.getPointAtLength(0).x, path.getPointAtLength(0).y)
      .matrixTransform(matrix);

    function thicknessAt(x: number) {
      let first: number | null = null;
      let last: number | null = null;
      for (let y = 0; y <= 18; y += 0.05) {
        if (!path!.isPointInFill(new DOMPoint(x, y))) continue;
        if (first === null) first = y;
        last = y;
      }
      return first === null || last === null ? 0 : last - first;
    }

    return {
      markHeight: mark.getBoundingClientRect().height,
      wordFontSize: Number.parseFloat(window.getComputedStyle(word).fontSize),
      horizontalOverlap: sRect.right - trailStart.x,
      trailStartY: trailStart.y,
      sTop: sRect.top,
      sBottom: sRect.bottom,
      trailWidth: path.ownerSVGElement?.getBoundingClientRect().width ?? 0,
      trailHeight: path.ownerSVGElement?.getBoundingClientRect().height ?? 0,
      trailLeft: Number.parseFloat(window.getComputedStyle(path.ownerSVGElement!).left),
      trailBottom: Number.parseFloat(window.getComputedStyle(path.ownerSVGElement!).bottom),
      initialThickness: thicknessAt(28),
      finalThickness: thicknessAt(126),
    };
  });

  expect(logoGeometry.markHeight).toBeGreaterThanOrEqual(86);
  expect(logoGeometry.markHeight).toBeLessThanOrEqual(89);
  expect(logoGeometry.wordFontSize).toBeCloseTo(56.7, 1);
  expect(logoGeometry.horizontalOverlap).toBeGreaterThanOrEqual(22);
  expect(logoGeometry.horizontalOverlap).toBeLessThanOrEqual(29);
  expect(logoGeometry.trailStartY).toBeGreaterThan(logoGeometry.sTop);
  expect(logoGeometry.trailStartY).toBeLessThan(logoGeometry.sBottom);
  expect(logoGeometry.trailWidth).toBeGreaterThanOrEqual(159);
  expect(logoGeometry.trailWidth).toBeLessThanOrEqual(166);
  expect(logoGeometry.trailHeight).toBeGreaterThanOrEqual(16);
  expect(logoGeometry.trailHeight).toBeLessThanOrEqual(19);
  expect(logoGeometry.trailLeft).toBe(-1);
  expect(logoGeometry.trailBottom).toBe(1);
  expect(logoGeometry.initialThickness).toBeGreaterThan(logoGeometry.finalThickness * 3);

  await homeLink.click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

for (const locale of [
  { route: "/", label: "Contactar a Senda por WhatsApp" },
  { route: "/en", label: "Contact Senda on WhatsApp" },
] as const) {
  test(`${locale.route} exposes the exact global WhatsApp destination and message`, async ({ page }) => {
    await page.goto(locale.route);
    const whatsapp = page.getByRole("link", { name: locale.label, exact: true });
    await expect(whatsapp).toBeVisible();
    await expect(whatsapp).toHaveAttribute("target", "_blank");
    await expect(whatsapp).toHaveAttribute("rel", /noopener/);
    await expect(whatsapp).toHaveAttribute("style", /safe-area-inset-bottom/);

    const href = await whatsapp.getAttribute("href");
    expect(href).toBeTruthy();
    const url = new URL(href!);
    expect(url.origin).toBe("https://wa.me");
    expect(url.pathname).toBe("/5491136736778");
    expect(url.searchParams.get("text")).toBe(whatsappMessage);
  });
}

test("theme persists and the subtle pointer illumination responds to a mouse", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");

  const pointerIllumination = page.locator(".pointer-illumination");
  const toggle = page.getByRole("button", { name: "Activar modo oscuro" }).first();
  await expect(pointerIllumination).toBeAttached();
  await expect(toggle).toHaveAttribute("data-state", "light");
  await page.mouse.move(1, 1);
  await page.mouse.move(720, 520, { steps: 2 });
  await expect(pointerIllumination).toHaveAttribute("data-visible", "true");

  await toggle.click();
  await expect.poll(() => page.locator("html").getAttribute("class")).toContain("dark");
  await page.reload();
  await expect.poll(() => page.locator("html").getAttribute("class")).toContain("dark");
  await expect(page.getByRole("button", { name: "Activar modo claro" }).first()).toHaveAttribute(
    "data-state",
    "dark",
  );
});

test("reduced motion keeps the complete logo static and disables ambient effects", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const logo = page
    .getByRole("banner")
    .getByRole("link", { name: "Ir al inicio de Senda" })
    .locator(".senda-logo");
  await expect(logo).toBeVisible();
  await expect(logo.locator(".senda-logo__orbit--one")).toHaveCSS("animation-name", "none");
  await expect(logo.locator(".senda-logo__orbit--two")).toHaveCSS("animation-name", "none");
  await expect(logo.locator(".senda-logo__trail path")).toHaveCSS("animation-name", "none");
  await expect(logo.locator(".senda-logo__trail path")).toBeVisible();
  await expect(page.locator(".pointer-illumination")).toHaveCSS("display", "none");
  await expect(page.locator(".universe-field__drift").first()).toHaveCSS("animation-name", "none");
  await expect.poll(() => page.evaluate(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
});

test("technical discovery files are valid and public", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain("Sitemap:");

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  const sitemapContent = await sitemap.text();
  expect(sitemapContent).toContain("<urlset");
  for (const route of [
    "/transiciones-laborales",
    "/transiciones-laborales/explorar-direccion",
    "/transiciones-laborales/cambiar-empleo",
    "/transiciones-laborales/proyecto-propio",
    "/transiciones-laborales/liderazgo-empresa",
    "/transiciones-laborales/desafio-puntual",
    "/transiciones-laborales/elegir-formacion",
    "/brujulas",
    "/encontrar-mi-recorrido",
    "/test-anclas-de-carrera",
    "/laboratorio-narrativas-laborales-alternativas",
  ]) {
    expect(sitemapContent).toContain(route);
    expect(sitemapContent).toContain(`/en${route}`);
  }
  expect(sitemapContent).not.toContain("/recorridos/brujula");
  expect(sitemapContent).not.toContain("/laboratorio-nuevas-narrativas");
  expect(sitemapContent).toContain("<loc>https://universosenda.com/sobre-mi</loc>");
  expect(sitemapContent).not.toContain("<loc>https://universosenda.com/equipo</loc>");

  const llms = await request.get("/llms.txt");
  expect(llms.ok()).toBe(true);
  const llmsContent = await llms.text();
  expect(llmsContent).toContain("Senda");
  expect(llmsContent).toContain("/transiciones-laborales");
  expect(llmsContent).toContain("/laboratorio-narrativas-laborales-alternativas");
  expect(llmsContent).not.toContain("/laboratorio-nuevas-narrativas");
});

test("SEO metadata: Open Graph image, Organization and FAQPage structured data are present", async ({ page, request }) => {
  const ogImageResponse = await request.get("/opengraph-image");
  expect(ogImageResponse.ok()).toBe(true);
  expect(ogImageResponse.headers()["content-type"]).toContain("image/png");
  expect((await ogImageResponse.body()).byteLength).toBeGreaterThan(1000);

  await page.goto("/");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    /\/opengraph-image/,
  );
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
    "content",
    /\/opengraph-image/,
  );

  const organizationJsonLd = await page
    .locator('script[type="application/ld+json"]')
    .first()
    .textContent();
  expect(organizationJsonLd).not.toBeNull();
  const organizationData = JSON.parse(organizationJsonLd ?? "{}");
  expect(organizationData["@type"]).toBe("Organization");
  expect(organizationData.name).toBe("Senda");

  await page.goto("/preguntas-frecuentes");
  const faqJsonLd = await page
    .locator('script[type="application/ld+json"]')
    .last()
    .textContent();
  expect(faqJsonLd).not.toBeNull();
  const faqData = JSON.parse(faqJsonLd ?? "{}");
  expect(faqData["@type"]).toBe("FAQPage");
  expect(faqData.mainEntity.length).toBe(7);
  expect(faqData.mainEntity[0].name).toContain("¿");

  await page.goto("/transiciones-laborales/cambiar-empleo");
  const breadcrumbJsonLd = await page
    .locator('script[type="application/ld+json"]')
    .last()
    .textContent();
  expect(breadcrumbJsonLd).not.toBeNull();
  const breadcrumbData = JSON.parse(breadcrumbJsonLd ?? "{}");
  expect(breadcrumbData["@type"]).toBe("BreadcrumbList");
  expect(breadcrumbData.itemListElement.map((item: { name: string }) => item.name)).toEqual([
    "Inicio",
    "Transiciones laborales",
    "Preparar un cambio de empleo",
  ]);
  expect(breadcrumbData.itemListElement[2].item).toBe(
    "https://universosenda.com/transiciones-laborales/cambiar-empleo",
  );
});
