import { expect, test } from "@playwright/test";

const retiredPublicTerms =
  /orientación vocacional|vocational guidance|reinvención profesional|professional reinvention|transición laboral|career transition/i;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("reinvencion_cookie_consent", "true");
    if (!window.localStorage.getItem("theme")) window.localStorage.setItem("theme", "light");
  });
});

test("home is a concise gateway to the two journeys and their supporting pages", async ({ page }) => {
  await page.goto("/");

  const home = page.locator("main .senda-home");
  await expect(home.locator(":scope > section")).toHaveCount(5);
  await expect(home.locator("article")).toHaveCount(2);
  await expect(home.locator("details")).toHaveCount(0);

  await expect(home.locator('a[href="/recorridos/brujula"]')).toBeVisible();
  await expect(home.locator('a[href="/recorridos/nueva-etapa-profesional"]')).toBeVisible();
  await expect(home.locator('a[href="/como-trabajamos"]').first()).toBeVisible();
  await expect(home.locator('a[href="/contacto"]')).toHaveCount(1);

  const publicText = await home.innerText();
  expect(publicText).not.toMatch(/Nuestra forma de acompañar|Herramientas al servicio/i);
  expect(publicText).not.toMatch(/Preguntas frecuentes|Antes de empezar/i);
  expect(publicText).not.toMatch(/\b(?:1500|1800|USD)\b|US\$/i);
  expect(publicText).not.toMatch(retiredPublicTerms);
  expect(publicText).not.toMatch(/No creemos que una persona sea (?:su|un) currículum/i);
});

for (const locale of [
  { prefix: "", diagnosticHref: "/diagnostico" },
  { prefix: "/en", diagnosticHref: "/en/diagnostico" },
] as const) {
  for (const journey of [
    { slug: "brujula", stages: 6 },
    { slug: "nueva-etapa-profesional", stages: 8 },
  ] as const) {
    test(`${locale.prefix || "/es"}/recorridos/${journey.slug} presents its complete journey`, async ({ page }) => {
      await page.goto(`${locale.prefix}/recorridos/${journey.slug}`);

      await expect(page.locator("main article ol > li")).toHaveCount(journey.stages);
      await expect(
        page.locator("main").getByRole("link", { name: /diagnóstico|diagnostic/i }).last(),
      ).toHaveAttribute("href", locale.diagnosticHref);

      const publicText = await page.locator("main").innerText();
      expect(publicText).not.toMatch(/\b(?:1500|1800|USD)\b|US\$/i);
      expect(publicText).not.toMatch(retiredPublicTerms);
    });
  }
}

test("contact form validates locally and preserves every value after a controlled server failure", async ({ page }) => {
  let submission: Record<string, unknown> | null = null;
  let requestHeader: string | null = null;

  await page.route("**/api/contact", async (route) => {
    submission = route.request().postDataJSON() as Record<string, unknown>;
    requestHeader = route.request().headers()["x-senda-form"] ?? null;
    await route.fulfill({
      status: 502,
      contentType: "application/json",
      body: JSON.stringify({ ok: false, code: "send" }),
    });
  });

  await page.goto("/contacto");
  const gmailLink = page.locator('main a[href^="https://mail.google.com/mail/"]');
  await expect(gmailLink).toBeVisible();
  const gmailUrl = new URL((await gmailLink.getAttribute("href")) ?? "");
  expect(gmailUrl.origin).toBe("https://mail.google.com");
  expect(gmailUrl.pathname).toBe("/mail/");
  expect(gmailUrl.searchParams.get("view")).toBe("cm");
  expect(gmailUrl.searchParams.get("fs")).toBe("1");
  expect(gmailUrl.searchParams.get("to")).toBe("hola@universosenda.com");
  await expect(gmailLink).toHaveAttribute("target", "_blank");
  await expect(gmailLink).toHaveAttribute("rel", "noopener noreferrer");
  await expect(gmailLink).toHaveAttribute("referrerpolicy", "no-referrer");
  await expect(page.locator("main").getByText("+54 9 11 3673-6778", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Enviar consulta" }).click();
  await expect(page.locator("#contact-name")).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#contact-email")).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#contact-message")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByRole("checkbox")).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("main [role=alert]")).toContainText("Revisá los campos indicados");

  await page.getByLabel("Nombre completo").fill("Ada Lovelace");
  await page.getByLabel("Teléfono (opcional)").fill("+54 9 11 1234-5678");
  await page.getByLabel("Email", { exact: true }).fill("ada@example.com");
  await page.getByLabel("Tu mensaje").fill("Quisiera conversar sobre mi próxima etapa y conocer el recorrido.");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Enviar consulta" }).click();

  await expect(page.locator("main [role=alert]")).toContainText("El servidor de correo no aceptó la consulta");
  await expect(page.getByLabel("Nombre completo")).toHaveValue("Ada Lovelace");
  await expect(page.getByLabel("Teléfono (opcional)")).toHaveValue("+54 9 11 1234-5678");
  await expect(page.getByLabel("Email", { exact: true })).toHaveValue("ada@example.com");
  await expect(page.getByLabel("Tu mensaje")).toHaveValue(
    "Quisiera conversar sobre mi próxima etapa y conocer el recorrido.",
  );
  await expect(page.getByRole("checkbox")).toBeChecked();
  await expect(page.getByRole("heading", { name: "¡Gracias por escribirnos!" })).toHaveCount(0);

  await expect.poll(() => submission).not.toBeNull();
  expect(submission).toMatchObject({
    name: "Ada Lovelace",
    phone: "+54 9 11 1234-5678",
    email: "ada@example.com",
    message: "Quisiera conversar sobre mi próxima etapa y conocer el recorrido.",
    consent: true,
    companyWebsite: "",
    sourcePage: "/contacto",
    locale: "es",
  });
  expect(requestHeader).toBe("contact");
});

test("contact form is landscape on desktop and stacks without overflow on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/contacto");

  const panel = page.locator('[data-contact-panel="form"]');
  const desktopPanel = await panel.boundingBox();
  expect(desktopPanel).not.toBeNull();
  expect(desktopPanel!.width / desktopPanel!.height).toBeGreaterThan(1.4);

  const desktopFieldTops = await Promise.all(
    ["#contact-name", "#contact-phone", "#contact-email"].map(async (selector) =>
      page.locator(selector).evaluate((element) => element.getBoundingClientRect().top),
    ),
  );
  expect(Math.max(...desktopFieldTops) - Math.min(...desktopFieldTops)).toBeLessThanOrEqual(2);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();

  const mobileFieldTops = await Promise.all(
    ["#contact-name", "#contact-phone", "#contact-email", "#contact-message"].map(async (selector) =>
      page.locator(selector).evaluate((element) => element.getBoundingClientRect().top),
    ),
  );
  expect(mobileFieldTops).toEqual([...mobileFieldTops].sort((a, b) => a - b));
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test("contact form confirms success only after the API accepts a valid submission", async ({ page }) => {
  await page.route("**/api/contact", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.goto("/en/contacto");
  const gmailLink = page.locator('main a[href^="https://mail.google.com/mail/"]');
  await expect(gmailLink).toHaveAttribute(
    "aria-label",
    "Open Gmail to write to Senda (opens in a new tab): hola@universosenda.com",
  );
  await expect(page.locator("main").getByText("+54 9 11 3673-6778", { exact: true })).toBeVisible();
  await page.getByLabel("Full name").fill("Grace Hopper");
  await page.getByLabel("Email", { exact: true }).fill("grace@example.com");
  await page.getByLabel("Your message").fill("I would like to learn more about the next-stage journey.");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Send inquiry" }).click();

  await expect(page.getByRole("status")).toContainText("Thank you for reaching out!");
  await expect(page.getByRole("button", { name: "Send another inquiry" })).toBeVisible();
});

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
