import { expect, test } from "@playwright/test";

const retiredPublicTerms =
  /orientación vocacional|vocational guidance|reinvenci[oó]n|reinventarse|professional reinvention|reinvent yourself/i;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("reinvencion_cookie_consent", "true");
    if (!window.localStorage.getItem("theme")) window.localStorage.setItem("theme", "light");
  });
});

test("home is a short gateway to the career anchors test and secondary proposals", async ({ page }) => {
  await page.goto("/");

  const home = page.locator("main .senda-home");
  await expect(home.locator(":scope > section")).toHaveCount(3);
  await expect(home.locator("article")).toHaveCount(0);
  await expect(home.locator("details")).toHaveCount(0);

  await expect(home.getByRole("heading", { level: 1 })).toContainText(/Acompañamos\s+transiciones laborales/);
  await expect(home.locator('a[href="/test-anclas-de-carrera"]').first()).toBeVisible();
  await expect(home.locator('a[href="/transiciones-laborales"]').first()).toBeVisible();
  await expect(home.locator('a[href="/laboratorio-narrativas-laborales-alternativas"]')).toHaveCount(0);
  await expect(home.locator('a[href="/brujulas"]')).toBeVisible();
  await expect(home.locator('a[href="/contacto"]')).toHaveCount(1);

  const hero = home.locator(":scope > section").first();
  await expect(hero).not.toContainText(/Brújulas|Compass/);

  const publicText = await home.innerText();
  expect(publicText).not.toMatch(/Señales para reconocerte|Signs to recognize/i);
  expect(publicText).not.toMatch(/Distintos momentos requieren preguntas distintas|Different moments call for different questions/i);
  expect(publicText).not.toMatch(/Cómo funciona Senda|How Senda works/i);
  expect(publicText).not.toMatch(/Nuestra forma de acompañar|Herramientas al servicio/i);
  expect(publicText).not.toMatch(/Preguntas frecuentes|Antes de empezar/i);
  expect(publicText).not.toMatch(/\b(?:1500|1800|USD)\b|US\$/i);
  expect(publicText).not.toMatch(retiredPublicTerms);
  expect(publicText).not.toMatch(/No creemos que una persona sea (?:su|un) currículum/i);
});

for (const locale of [{ prefix: "" }, { prefix: "/en" }] as const) {
  test(`${locale.prefix || "/es"} presents every complete service`, async ({ page }) => {
    for (const service of [
      { path: "/transiciones-laborales/explorar-direccion", stages: 7 },
      { path: "/transiciones-laborales/cambiar-empleo", stages: 8 },
      { path: "/transiciones-laborales/proyecto-propio", stages: 9 },
      { path: "/transiciones-laborales/liderazgo-empresa", stages: 9 },
      { path: "/transiciones-laborales/desafio-puntual", stages: 6 },
      { path: "/transiciones-laborales/elegir-formacion", stages: 9 },
      { path: "/brujulas", stages: 0 },
    ] as const) {
      await page.goto(`${locale.prefix}${service.path}`);

      await expect(page.locator("main article ol > li")).toHaveCount(service.stages);

      const publicText = await page.locator("main").innerText();
      expect(publicText).not.toMatch(/\b(?:1500|1800|USD)\b|US\$/i);
      expect(publicText).not.toMatch(retiredPublicTerms);
    }
  });
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
  const mailLink = page.locator('main a[href="mailto:hola@universosenda.com"]');
  await expect(mailLink).toBeVisible();
  await expect(page.locator("main").getByText("+54 9 11 3673-6778", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Enviar consulta" }).click();
  await expect(page.locator("#contact-name")).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#contact-phone")).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#contact-email")).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#contact-message")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByRole("checkbox")).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("main [role=alert]")).toContainText("Revisá los campos indicados");

  await page.getByLabel("Nombre completo").fill("Ada Lovelace");
  await page.getByLabel("Teléfono").fill("+54 9 11 1234-5678");
  await page.getByLabel("Email", { exact: true }).fill("ada@example.com");
  await page.getByLabel("Tu mensaje").fill("Quisiera conversar sobre mi próxima etapa y conocer el recorrido.");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Enviar consulta" }).click();

  await expect(page.locator("main [role=alert]")).toContainText("El servidor de correo no aceptó la consulta");
  await expect(page.getByLabel("Nombre completo")).toHaveValue("Ada Lovelace");
  await expect(page.getByLabel("Teléfono")).toHaveValue("+54 9 11 1234-5678");
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
  const mailLink = page.locator('main a[href="mailto:hola@universosenda.com"]');
  await expect(mailLink).toHaveAttribute(
    "aria-label",
    "Write an email to Senda: hola@universosenda.com",
  );
  await expect(page.locator("main").getByText("+54 9 11 3673-6778", { exact: true })).toBeVisible();
  await page.getByLabel("Full name").fill("Grace Hopper");
  await page.getByLabel("Phone").fill("+54 9 11 1234-5678");
  await page.getByLabel("Email", { exact: true }).fill("grace@example.com");
  await page.getByLabel("Your message").fill("I would like to learn more about the next-stage journey.");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Send inquiry" }).click();

  const successStatus = page.getByRole("status");
  await expect(successStatus).toContainText("Thank you for reaching out!");
  await expect(successStatus).toBeFocused();
  await expect(page.getByRole("button", { name: "Send another inquiry" })).toBeVisible();
});

test("laboratory interest preserves its data when the secure contact endpoint rejects delivery", async ({ page }) => {
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

  await page.goto("/laboratorio-narrativas-laborales-alternativas");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /\/laboratorio-narrativas-laborales-alternativas$/,
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    /Laboratorio de Narrativas Laborales Alternativas/,
  );
  await expect(page.locator("main ol > li")).toHaveCount(9);
  await expect(page.getByRole("textbox", { name: "Website" })).toHaveCount(0);

  const nameField = page.getByLabel("Nombre");
  const submitButton = page.getByRole("button", { name: "Quiero recibir novedades" });
  await submitButton.click();
  await expect(nameField).toBeFocused();
  await expect(nameField).toHaveAttribute("aria-invalid", "true");
  expect(submission).toBeNull();

  await nameField.fill("Ada Lovelace");
  await page.getByLabel("Correo electrónico").fill("ada@example.com");
  await page.getByLabel("Teléfono").fill("+54 9 11 1234-5678");
  await page
    .getByLabel("¿Qué te interesa explorar? (opcional)")
    .fill("Quiero revisar cómo narro mi trayectoria y qué deseo conservar.");
  await page.getByRole("checkbox").check();
  await submitButton.click();

  await expect(page.locator("main [role=alert]")).toContainText(
    "El servidor de correo no aceptó la solicitud",
  );
  await expect(page.getByLabel("Nombre")).toHaveValue("Ada Lovelace");
  await expect(page.getByLabel("Correo electrónico")).toHaveValue("ada@example.com");
  await expect(page.getByLabel("Teléfono")).toHaveValue("+54 9 11 1234-5678");
  await expect(page.getByLabel("¿Qué te interesa explorar? (opcional)")).toHaveValue(
    "Quiero revisar cómo narro mi trayectoria y qué deseo conservar.",
  );
  await expect(page.getByRole("checkbox")).toBeChecked();
  await expect(page.getByRole("status")).toHaveCount(0);

  await expect.poll(() => submission).not.toBeNull();
  expect(submission).toEqual({
    formOrigin: "laboratorio_narrativas_laborales_alternativas",
    name: "Ada Lovelace",
    phone: "+54 9 11 1234-5678",
    email: "ada@example.com",
    explorationInterest: "Quiero revisar cómo narro mi trayectoria y qué deseo conservar.",
    consent: true,
    companyWebsite: "",
    sourcePage: "/laboratorio-narrativas-laborales-alternativas",
    locale: "es",
  });
  expect(requestHeader).toBe("contact");
});

test("laboratory interest confirms only an accepted English submission", async ({ page }) => {
  let attempts = 0;
  await page.route("**/api/contact", async (route) => {
    attempts += 1;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(attempts === 1 ? { ok: false, code: "send" } : { ok: true }),
    });
  });

  await page.goto("/en/laboratorio-narrativas-laborales-alternativas");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /\/en\/laboratorio-narrativas-laborales-alternativas$/,
  );
  await page.getByLabel("Name").fill("Grace Hopper");
  await page.getByLabel("Email address").fill("grace@example.com");
  await page.getByLabel("Phone").fill("+54 9 11 1234-5678");
  await page.getByRole("checkbox").check();
  const submitButton = page.getByRole("button", { name: "I want to receive updates" });
  await submitButton.click();

  await expect(page.getByRole("status")).toHaveCount(0);
  await expect(page.locator("main [role=alert]")).toContainText(
    "The mail server did not accept the request",
  );
  await expect(page.getByLabel("Name")).toHaveValue("Grace Hopper");
  await expect(page.getByLabel("Email address")).toHaveValue("grace@example.com");

  await submitButton.click();
  const successStatus = page.getByRole("status");
  await expect(successStatus).toContainText("We have registered your interest");
  await expect(successStatus).toBeFocused();
  expect(attempts).toBe(2);
});

test("each transiciones-laborales service has an inline lead form that submits to /api/contact", async ({ page }) => {
  let submission: Record<string, unknown> | null = null;

  await page.route("**/api/contact", async (route) => {
    submission = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.goto("/transiciones-laborales");
  const rows = page.locator("main article");
  await expect(rows).toHaveCount(6);

  const secondRow = rows.nth(1);
  await secondRow.getByLabel("Nombre").fill("Ada Lovelace");
  await secondRow.getByLabel("Teléfono").fill("+54 9 11 1234-5678");
  await secondRow.getByLabel("Correo electrónico").fill("ada@example.com");
  await secondRow.getByRole("checkbox").check();
  await secondRow.getByRole("button", { name: "Quiero que me escriban" }).click();

  await expect(secondRow.getByRole("status")).toContainText("Recibimos tus datos");
  expect(submission).toMatchObject({
    formOrigin: "transiciones_laborales_interes",
    service: "cambiar-empleo",
    name: "Ada Lovelace",
    phone: "+54 9 11 1234-5678",
    email: "ada@example.com",
    consent: true,
    sourcePage: "/transiciones-laborales",
    locale: "es",
  });
});
