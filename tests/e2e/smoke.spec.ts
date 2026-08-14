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
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Brújula", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Nueva Etapa Profesional", exact: true })).toBeVisible();
  await expect(page.locator('main a[href="/recorridos/brujula"]')).toBeVisible();
  await expect(page.locator('main a[href="/recorridos/nueva-etapa-profesional"]')).toBeVisible();

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

test("logo links home and exposes both slow orbits and the live trail", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/equipo");

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
  expect(sitemapContent).toContain("/recorridos/brujula");
  expect(sitemapContent).toContain("/recorridos/nueva-etapa-profesional");
  expect(sitemapContent).toContain("/laboratorio-nuevas-narrativas");
  expect(sitemapContent).toContain("/en/laboratorio-nuevas-narrativas");

  const llms = await request.get("/llms.txt");
  expect(llms.ok()).toBe(true);
  const llmsContent = await llms.text();
  expect(llmsContent).toContain("Senda");
  expect(llmsContent).toContain("/laboratorio-nuevas-narrativas");
});
