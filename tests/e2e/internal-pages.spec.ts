import { expect, test } from "@playwright/test";

const routes = [
  "/contacto",
  "/diagnostico",
  "/orientacion-vocacional",
  "/terapia",
  "/quienes-somos",
  "/servicios/ingles-profesional",
  "/privacidad",
  "/terminos",
  "/login",
];

for (const route of routes) {
  test(`${route} is readable in light and dark modes`, async ({ page }) => {
    const failedSameOriginResources: string[] = [];
    page.on("requestfailed", (request) => {
      if (request.url().startsWith("http://127.0.0.1:3000")) failedSameOriginResources.push(request.url());
    });

    await page.addInitScript(() => window.localStorage.setItem("senda-theme", "light"));
    await page.goto(route);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const toggle = page.getByRole("button", { name: /Activar modo (oscuro|claro)/ }).first();
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
