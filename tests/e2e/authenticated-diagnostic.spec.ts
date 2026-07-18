import { expect, test } from "@playwright/test";

const storageState = process.env.E2E_AUTH_STORAGE_STATE;

test.describe("authenticated career diagnostic", () => {
  test.skip(!storageState, "E2E_AUTH_STORAGE_STATE is required for authenticated CI coverage.");
  test.use({ storageState: storageState || undefined });

  test("opens the diagnostic for an authenticated technical account", async ({ page }) => {
    await page.goto("/diagnostico/ancla-de-carrera");
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { name: /ancla de carrera|career anchor/i })).toBeVisible();
    const accountMenu = page.getByRole("button", { name: /mi recorrido|my journey/i });
    await expect(accountMenu).toBeVisible();
    await accountMenu.click();
    await expect(page.getByRole("menuitem", { name: /mi último resultado/i })).toHaveAttribute("href", "/panel#resultado");
    await expect(page.getByRole("link", { name: /ingresar|sign in/i })).toHaveCount(0);
  });

  test("shows the latest saved result in the personal panel", async ({ page }) => {
    await page.goto("/panel#resultado");
    await expect(page.getByRole("heading", { name: /mi recorrido/i })).toBeVisible();
    await expect(page.getByText(/tu último resultado/i)).toBeVisible();
  });
});
