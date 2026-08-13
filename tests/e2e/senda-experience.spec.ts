import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("reinvencion_cookie_consent", "true");
    window.localStorage.setItem("theme", "light");
  });
});

test("the public experience contains the required journey and no public prices", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("#procesos article")).toHaveCount(2);
  await expect(page.locator("#como-funciona li")).toHaveCount(4);
  await expect(page.locator("#preguntas details")).toHaveCount(7);
  await expect(page.getByText(/No creemos que una persona sea (?:su|un) currículum/i)).toHaveCount(0);

  const publicText = await page.locator("main").innerText();
  expect(publicText).not.toMatch(/\b(?:1500|1800|USD)\b|US\$/i);
  expect(publicText).not.toMatch(/orientación vocacional|reinvención profesional|transición laboral/i);
});

for (const process of [
  { slug: "brujula", stages: 6 },
  { slug: "nueva-etapa-profesional", stages: 8 },
] as const) {
  test(`${process.slug} presents its complete journey`, async ({ page }) => {
    await page.goto(`/procesos/${process.slug}`);
    await expect(page.locator("main article ol > li")).toHaveCount(process.stages);
    await expect(page.getByRole("link", { name: /diagnóstico|diagnostic/i }).last()).toHaveAttribute("href", "/diagnostico");
    expect(await page.locator("main").innerText()).not.toMatch(/\b(?:1500|1800|USD)\b|US\$/i);
  });
}

test("the initial diagnostic validates each step and preserves navigation", async ({ page }) => {
  await page.goto("/diagnostico");

  const continueButton = page.getByRole("button", { name: /Continuar|Continue/ });
  await continueButton.click();
  await expect(page.locator("#situation-error")).toContainText(/Elegí una opción|Choose an option/);

  await page
    .getByRole("radio", { name: "Quiero releer mi trayectoria y definir una nueva etapa." })
    .check({ force: true });
  await continueButton.click();
  await expect(page.getByRole("group", { name: "¿Qué necesitás hoy?" })).toBeVisible();

  await page.getByRole("radio", { name: "Redefinir mi dirección." }).check({ force: true });
  await continueButton.click();
  await page.getByRole("radio", { name: "Profesional con experiencia." }).check({ force: true });
  await continueButton.click();
  await page
    .getByRole("radio", { name: "Quiero empezar a moverme pronto." })
    .check({ force: true });
  await continueButton.click();

  await expect(page.getByRole("group", { name: "¿Cómo podemos contactarte?" })).toBeVisible();
  await expect(page.getByText("Ingresá tu nombre.")).toHaveCount(0);
  await page.getByRole("button", { name: "Volver" }).click();
  await expect(page.getByRole("radio", { name: "Quiero empezar a moverme pronto." })).toBeChecked();
});
