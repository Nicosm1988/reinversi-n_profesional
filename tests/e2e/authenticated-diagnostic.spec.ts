import { expect, test } from "@playwright/test";

const storageState = process.env.E2E_AUTH_STORAGE_STATE;

test.describe("authenticated career diagnostic", () => {
  test.skip(!storageState, "E2E_AUTH_STORAGE_STATE is required for authenticated CI coverage.");
  test.use({ storageState: storageState || undefined });

  test("opens the diagnostic for an authenticated technical account", async ({ page }) => {
    await page.setViewportSize({ width: 1720, height: 900 });
    await page.goto("/test-anclas-de-carrera");
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      /Las motivaciones detrás de tus decisiones profesionales|Antes de responder|Tu recorrido sigue guardado|Este recorrido ya forma parte de tu perfil/i,
    );
    const accountMenu = page.getByRole("button", { name: /mi recorrido|my journey/i });
    await expect(accountMenu).toBeVisible();
    await accountMenu.click();
    await expect(page.getByRole("menuitem", { name: /mi último resultado/i })).toHaveAttribute("href", "/panel#resultado");
    await expect(page.getByRole("link", { name: /ingresar|sign in/i })).toHaveCount(0);
  });

  test("shows the Career Anchors result state in the personal panel", async ({ page }) => {
    await page.goto("/panel#resultado");
    await expect(page.getByRole("heading", { name: /mi recorrido/i })).toBeVisible();
    await expect(page.getByText(/tu último resultado/i)).toBeVisible();
    const savedResult = page.getByRole("heading", { name: "Mis Anclas de Carrera", exact: true });
    const emptyResult = page.getByRole("heading", {
      name: "Todavía no hay un resultado guardado",
      exact: true,
    });
    await expect.poll(async () => (await savedResult.count()) + (await emptyResult.count())).toBe(1);
  });
});
