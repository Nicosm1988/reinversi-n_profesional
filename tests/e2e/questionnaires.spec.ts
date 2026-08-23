import { expect, test, type Page } from "@playwright/test";
import englishQuizData from "@/lib/data/anchors.en.json";
import spanishQuizData from "@/lib/data/anchors.json";

type RouteFinderAnswers = {
  situation: string;
  need: string;
  careerStage: string;
  urgency: string;
};

const routeCases = [
  {
    id: "explorar-direccion",
    title: "Explorar una nueva dirección profesional",
    answers: { situation: "direction", need: "identity", careerStage: "life", urgency: "exploring" },
  },
  {
    id: "cambiar-empleo",
    title: "Preparar un cambio de empleo",
    answers: { situation: "jobChange", need: "search", careerStage: "experienced", urgency: "move-soon" },
  },
  {
    id: "proyecto-propio",
    title: "Construir o reordenar un proyecto propio",
    answers: { situation: "project", need: "validate", careerStage: "owner", urgency: "move-soon" },
  },
  {
    id: "liderazgo-empresa",
    title: "Pensar el liderazgo y la continuidad de una empresa",
    answers: { situation: "leadership", need: "lead", careerStage: "leadership", urgency: "exploring" },
  },
  {
    id: "desafio-puntual",
    title: "Abordar un desafío profesional puntual",
    answers: { situation: "focused", need: "decide", careerStage: "experienced", urgency: "short-term-decision" },
  },
  {
    id: "elegir-formacion",
    title: "Elegir una formación para el próximo paso",
    answers: { situation: "education", need: "learn", careerStage: "higher", urgency: "exploring" },
  },
  {
    id: "brujulas",
    title: "Brújulas",
    answers: { situation: "compass", need: "firstDecisions", careerStage: "secondary", urgency: "exploring" },
  },
] as const satisfies ReadonlyArray<{
  id: string;
  title: string;
  answers: RouteFinderAnswers;
}>;

const finderLabels = {
  es: {
    prefix: "",
    next: "Continuar",
    submit: "Ver mi orientación",
    back: "Volver",
    result: "Un punto de partida para seguir avanzando.",
    shareTitle: "Quiero que Senda reciba mi resultado y se contacte conmigo",
    shareSubmit: "Compartir mi resultado",
  },
  en: {
    prefix: "/en",
    next: "Continue",
    submit: "See my orientation",
    back: "Back",
    result: "A starting point for moving forward.",
    shareTitle: "I want Senda to receive my result and contact me",
    shareSubmit: "Share my result",
  },
} as const;

async function chooseFinderAnswers(
  page: Page,
  answers: RouteFinderAnswers,
  locale: keyof typeof finderLabels = "es",
) {
  const labels = finderLabels[locale];
  const form = page.locator("main form").first();
  const orderedAnswers = [
    ["situation", answers.situation],
    ["need", answers.need],
    ["careerStage", answers.careerStage],
    ["urgency", answers.urgency],
  ] as const;

  for (const [index, [field, value]] of orderedAnswers.entries()) {
    const input = form.locator(`input[name="${field}"][value="${value}"]`);
    await input.locator("..").click();
    await expect(input).toBeChecked();
    await form
      .getByRole("button", {
        name: index === orderedAnswers.length - 1 ? labels.submit : labels.next,
        exact: true,
      })
      .click();
  }

  await expect(page.locator("#primary-route-title")).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("reinvencion_cookie_consent", "true");
    window.localStorage.setItem("theme", "light");
  });
});

for (const routeCase of routeCases) {
  test(`route finder renders the ${routeCase.id} result without collecting personal data`, async ({ page }) => {
    let contactRequests = 0;
    page.on("request", (request) => {
      if (request.url().endsWith("/api/contact") && request.method() === "POST") contactRequests += 1;
    });

    await page.goto("/encontrar-mi-recorrido");
    await chooseFinderAnswers(page, routeCase.answers);

    await expect(page.locator("#primary-route-title")).toHaveText(routeCase.title);
    await expect(
      page.locator(`main a[href="/transiciones-laborales/${routeCase.id}"], main a[href="/brujulas"]`).filter({
        hasText: "Conocer esta propuesta",
      }).first(),
    ).toHaveAttribute(
      "href",
      routeCase.id === "brujulas" ? "/brujulas" : `/transiciones-laborales/${routeCase.id}`,
    );
    await expect(page.getByRole("heading", { name: "Las señales que orientaron este resultado" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Qué podrías trabajar" })).toBeVisible();
    await expect(page.getByText("Este resultado es orientativo y no reemplaza una conversación profesional.").last()).toBeVisible();
    await expect(page.getByRole("heading", { name: finderLabels.es.shareTitle })).toBeVisible();
    expect(contactRequests).toBe(0);

    const serialized = await page.evaluate(() => window.localStorage.getItem("senda_route_finder_answers_v1"));
    expect(serialized).toBeTruthy();
    expect(serialized ?? "").not.toMatch(/fullName|email|phone/i);
  });
}

test("route finder validates, preserves Back navigation, exposes a close alternative and focuses the result", async ({ page }) => {
  await page.goto("/encontrar-mi-recorrido");
  const form = page.locator("main form").first();

  await form.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(page.locator("#situation-error")).toContainText("Elegí una opción");

  await form.locator('input[name="situation"][value="direction"]').check({ force: true });
  await form.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(form.locator("fieldset legend")).toBeFocused();
  await form.locator('input[name="need"][value="learn"]').check({ force: true });
  await form.getByRole("button", { name: "Continuar", exact: true }).click();
  await form.locator('input[name="careerStage"][value="higher"]').check({ force: true });
  await form.getByRole("button", { name: "Continuar", exact: true }).click();
  await form.locator('input[name="urgency"][value="exploring"]').check({ force: true });

  await form.getByRole("button", { name: "Volver", exact: true }).click();
  await expect(form.locator('input[name="careerStage"][value="higher"]')).toBeChecked();
  await form.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(form.locator('input[name="urgency"][value="exploring"]')).toBeChecked();
  await form.getByRole("button", { name: "Ver mi orientación", exact: true }).click();

  const resultHeading = page.locator("#primary-route-title");
  await expect(resultHeading).toBeFocused();
  await expect(resultHeading).toHaveText("Explorar una nueva dirección profesional");
  await expect(page.locator("#secondary-route-title")).toHaveText("Elegir una formación para el próximo paso");
  await expect(page.locator('main a[href="/transiciones-laborales/elegir-formacion"]')).toBeVisible();
});

test("route finder remembers a completed result and skips the questionnaire on return", async ({ page }) => {
  await page.goto("/encontrar-mi-recorrido");
  await chooseFinderAnswers(page, routeCases[0].answers);
  await expect(page.locator("#primary-route-title")).toHaveText(routeCases[0].title);

  await page.reload();
  await expect(page.locator("#primary-route-title")).toHaveText(routeCases[0].title);
  await expect(page.locator('input[name="situation"]')).toHaveCount(0);
});

test("urgent answers preserve the grounded route and add a human-contact signal", async ({ page }) => {
  await page.goto("/encontrar-mi-recorrido");
  await chooseFinderAnswers(page, {
    situation: "project",
    need: "validate",
    careerStage: "owner",
    urgency: "urgent",
  });

  await expect(page.locator("#primary-route-title")).toHaveText("Construir o reordenar un proyecto propio");
  await expect(page.getByRole("heading", { name: "Tal vez sea importante conversar antes de elegir un recorrido" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Conversar con Senda", exact: true }).first()).toHaveAttribute("href", "/contacto");
});

test("English route finder keeps locale through its recommendation", async ({ page }) => {
  await page.goto("/en/encontrar-mi-recorrido");
  await chooseFinderAnswers(
    page,
    { situation: "jobChange", need: "search", careerStage: "experienced", urgency: "move-soon" },
    "en",
  );

  await expect(page.locator("#primary-route-title")).toHaveText("Prepare for a job change");
  await expect(page.locator('main a[href="/en/transiciones-laborales/cambiar-empleo"]').first()).toBeVisible();
  await expect(page.getByRole("heading", { name: finderLabels.en.shareTitle })).toBeVisible();
});

test("route-finder sharing requires consent, preserves values on failure and confirms only acceptance", async ({ page }) => {
  const submissions: Record<string, unknown>[] = [];
  let contactAttempts = 0;
  await page.route("**/api/contact", async (route) => {
    contactAttempts += 1;
    submissions.push(route.request().postDataJSON() as Record<string, unknown>);
    await route.fulfill({
      status: contactAttempts === 1 ? 502 : 200,
      contentType: "application/json",
      body: JSON.stringify(contactAttempts === 1 ? { ok: false, code: "send" } : { ok: true }),
    });
  });

  await page.goto("/encontrar-mi-recorrido");
  await chooseFinderAnswers(page, routeCases[2].answers);

  const share = page.getByRole("heading", { name: finderLabels.es.shareTitle }).locator("..");
  await share.getByLabel("Nombre", { exact: true }).fill("Ada Lovelace");
  await share.getByLabel("Correo", { exact: true }).fill("ada@example.com");
  await share.getByLabel(/Teléfono/).fill("+54 9 11 1234-5678");
  await share.getByLabel("Preferencia de contacto").selectOption("whatsapp");
  await share.getByLabel(/Mensaje/).fill("Quiero conversar sobre este resultado.");

  await share.getByRole("button", { name: finderLabels.es.shareSubmit }).click();
  await expect(share.getByRole("alert")).toBeVisible();
  expect(contactAttempts).toBe(0);

  await share.getByRole("checkbox").check();
  await share.getByRole("button", { name: finderLabels.es.shareSubmit }).click();
  await expect(share.getByRole("alert")).toBeVisible();
  await expect(share.getByLabel("Nombre", { exact: true })).toHaveValue("Ada Lovelace");
  await expect(share.getByLabel("Correo", { exact: true })).toHaveValue("ada@example.com");
  expect(contactAttempts).toBe(1);

  await share.getByRole("button", { name: finderLabels.es.shareSubmit }).click();
  await expect(share.getByRole("status")).toContainText("El servidor aceptó el envío");
  expect(contactAttempts).toBe(2);
  expect(submissions[0]).toMatchObject({
    formOrigin: "diagnostic_result",
    name: "Ada Lovelace",
    email: "ada@example.com",
    phone: "+54 9 11 1234-5678",
    preferredContact: "whatsapp",
    message: "Quiero conversar sobre este resultado.",
    consent: true,
    sourcePage: "/encontrar-mi-recorrido",
    locale: "es",
    result: {
      questionnaire: "route_finder",
      recommendedService: "Construir o reordenar un proyecto propio",
    },
  });
  expect(JSON.stringify(submissions[0])).not.toMatch(/rawAnswers|captchaToken/i);
});

type CareerLocale = "es" | "en";

const careerLabels = {
  es: {
    route: "/test-anclas-de-carrera",
    continue: "Continuar",
    transition: "Elegir las 3 más importantes",
    resultButton: "Conocer mi resultado",
    result: "Tu mapa de anclas de carrera",
    tie: "Ancla principal compartida",
    progress: "Progreso general",
    topThree: "Estas son tus 3 anclas principales",
    contextLabel: "¿Qué situación profesional estás atravesando?",
    contextButton: "Preparar mi lectura orientativa",
    shareTitle: "Quiero que Senda reciba mi resultado y se contacte conmigo",
    shareSubmit: "Compartir mi resultado",
  },
  en: {
    route: "/en/test-anclas-de-carrera",
    continue: "Continue",
    transition: "Choose the 3 most important",
    resultButton: "View my result",
    result: "Your career anchor map",
    tie: "Shared primary anchor",
    progress: "Overall progress",
    topThree: "These are your 3 primary anchors",
    contextLabel: "What professional situation are you navigating?",
    contextButton: "Prepare my initial interpretation",
    shareTitle: "I want Senda to receive my result and contact me",
    shareSubmit: "Share my result",
  },
} as const;

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function completeCareerAnchors(page: Page, locale: CareerLocale, keyboardBonus = false) {
  const labels = careerLabels[locale];
  const quizData = locale === "en" ? englishQuizData : spanishQuizData;
  await page.goto(labels.route);
  await expect(page).not.toHaveURL(/\/login/);
  await expect(page.locator('iframe[src*="challenges.cloudflare.com"]')).toHaveCount(0);

  const questionList = page.getByTestId("career-anchor-question-list");
  await expect(questionList.locator("fieldset")).toHaveCount(40);
  await expect(page.locator('input[name="question-1"]')).toHaveCount(6);
  await expect(page.locator('input[name="question-40"]')).toHaveCount(6);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ),
  ).toBeLessThanOrEqual(1);

  const progress = page.getByRole("progressbar", { name: labels.progress });
  const continueButton = page.getByRole("button", { name: labels.continue, exact: true });
  await expect(progress).toHaveAttribute("aria-valuenow", "0");
  await expect(continueButton).toBeDisabled();

  for (let questionId = 1; questionId <= 40; questionId += 1) {
    const score = questionId === 9 || questionId === 10 ? 2 : 1;
    const answer = page.locator(`input[name="question-${questionId}"][value="${score}"]`);
    await answer.locator("..").click();
    await expect(answer).toBeChecked();
  }
  await expect(progress).toHaveAttribute("aria-valuenow", "40");
  await expect(progress).toHaveAttribute("aria-valuetext", "100%");
  await expect(continueButton).toBeEnabled();
  await continueButton.click();
  await expect(page.locator("#career-quiz-step-heading")).toBeFocused();

  await page.getByRole("button", { name: labels.transition, exact: true }).click();
  await expect(page.locator("#career-quiz-step-heading")).toBeFocused();
  const priorityList = page.getByTestId("career-anchor-priority-list");
  await expect(priorityList.getByRole("button")).toHaveCount(40);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ),
  ).toBeLessThanOrEqual(1);
  const bonusQuestions = quizData.questions.slice(0, 3);
  for (const [index, question] of bonusQuestions.entries()) {
    const option = page.getByRole("button", { name: new RegExp(escapeRegex(question.text)) });
    if (index === 0 && keyboardBonus) {
      await option.focus();
      await page.keyboard.press("Space");
    } else {
      await option.click();
    }
    await expect(option).toHaveAttribute("aria-pressed", "true");
  }

  await page.getByRole("button", { name: labels.resultButton, exact: true }).click();

  const resultHeading = page.getByRole("heading", { name: labels.result, exact: true });
  await expect(resultHeading).toBeVisible();
  await expect(resultHeading).toBeFocused();
  await expect(page.getByText(labels.tie, { exact: true })).toHaveCount(0);
  const topThree = page.getByTestId("career-anchor-top-three");
  await expect(topThree.getByRole("heading", { name: labels.topThree, exact: true })).toBeVisible();
  await expect(topThree.locator("[data-career-anchor-priority]")).toHaveCount(3);
  await expect(page.locator(".career-quiz")).not.toContainText(/\b\d+\s+(?:puntos|points)\b/i);
  await expect(page.getByText(/generación asistida|lógica determinística|assisted generation|deterministic logic/i)).toHaveCount(0);
}

test("complete Spanish Career Anchors flow breaks ties into unique positions, auto-generates a reading and allows consented sharing", async ({ page }) => {
  test.slow();
  let analyzeRequests = 0;
  let persistedPublicAttempts = 0;
  let interpretationAttempts = 0;
  let interpretationPayload: Record<string, unknown> | null = null;
  const contactSubmissions: Record<string, unknown>[] = [];
  let contactAttempts = 0;

  page.on("request", (request) => {
    if (request.url().endsWith("/api/diagnostics/analyze")) analyzeRequests += 1;
    if (request.url().endsWith("/api/diagnostics/complete-public")) persistedPublicAttempts += 1;
  });
  await page.route("**/api/diagnostics/interpret", async (route) => {
    interpretationAttempts += 1;
    interpretationPayload = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        mode: "ai",
        title: "Una lectura asistida posible",
        summary: "La competencia técnica y la gestión comparten el primer lugar sin definir por sí solas una decisión.",
        tensions: ["Equilibrar profundidad y coordinación.", "Evitar decisiones apresuradas."],
        reflectionQuestions: ["¿Qué querés preservar?", "¿Qué falta hoy?", "¿Qué podrías probar?"],
        stageConnection: "El cambio de empleo puede compararse con estos criterios.",
        relevantServices: [
          {
            slug: "/transiciones-laborales/cambiar-empleo",
            label: "Preparar un cambio de empleo",
            reason: "Permite ordenar alternativas sin convertir el resultado en una prescripción.",
          },
        ],
        nextSteps: ["Revisar experiencias.", "Comparar una alternativa.", "Definir un experimento pequeño."],
      }),
    });
  });
  await page.route("**/api/contact", async (route) => {
    contactAttempts += 1;
    contactSubmissions.push(route.request().postDataJSON() as Record<string, unknown>);
    await route.fulfill({
      status: contactAttempts === 1 ? 502 : 200,
      contentType: "application/json",
      body: JSON.stringify(contactAttempts === 1 ? { ok: false, code: "send" } : { ok: true }),
    });
  });

  await page.setViewportSize({ width: 1440, height: 900 });
  await completeCareerAnchors(page, "es", true);
  expect(analyzeRequests).toBe(0);
  expect(persistedPublicAttempts).toBe(0);
  expect(contactAttempts).toBe(0);

  await expect(page.getByRole("heading", { name: "Una lectura asistida posible" })).toBeVisible();
  await expect(page.locator(".career-quiz").getByRole("link", { name: /Preparar un cambio de empleo/ })).toHaveAttribute(
    "href",
    "/transiciones-laborales/cambiar-empleo",
  );
  expect(interpretationAttempts).toBe(1);
  expect(interpretationPayload).toMatchObject({ careerStage: "prefer_not_to_say", locale: "es" });
  expect(JSON.stringify(interpretationPayload)).not.toMatch(/name|email|phone|ranking/i);

  const share = page.getByRole("heading", { name: careerLabels.es.shareTitle }).locator("..");
  await share.getByLabel("Nombre", { exact: true }).fill("Grace Hopper");
  await share.getByLabel("Correo", { exact: true }).fill("grace@example.com");
  await share.getByLabel("Teléfono", { exact: true }).fill("+54 9 11 5555-4444");
  await share.getByLabel("Preferencia de contacto").selectOption("email");
  await share.getByLabel(/Mensaje/).fill("Quiero conversar sobre mis anclas.");
  await share.getByRole("button", { name: careerLabels.es.shareSubmit }).click();
  await expect(share.getByRole("alert")).toBeVisible();
  expect(contactAttempts).toBe(0);

  await share.getByRole("checkbox").check();
  await share.getByRole("button", { name: careerLabels.es.shareSubmit }).click();
  await expect(share.getByRole("alert")).toBeVisible();
  await expect(share.getByLabel("Nombre", { exact: true })).toHaveValue("Grace Hopper");
  expect(contactAttempts).toBe(1);

  await share.getByRole("button", { name: careerLabels.es.shareSubmit }).click();
  await expect(share.getByRole("status")).toContainText("El servidor aceptó el envío");
  expect(contactAttempts).toBe(2);
  expect(contactSubmissions[0]).toMatchObject({
    formOrigin: "diagnostic_result",
    name: "Grace Hopper",
    email: "grace@example.com",
    preferredContact: "email",
    consent: true,
    sourcePage: "/test-anclas-de-carrera",
    locale: "es",
    result: {
      questionnaire: "career_anchors",
      primaryAnchors: ["Técnica/Funcional"],
    },
  });
});

test("complete English Career Anchors flow remains usable, themed and overflow-free on mobile", async ({ page }) => {
  test.slow();
  let analyzeRequests = 0;
  let persistedPublicAttempts = 0;
  page.on("request", (request) => {
    if (request.url().endsWith("/api/diagnostics/analyze")) analyzeRequests += 1;
    if (request.url().endsWith("/api/diagnostics/complete-public")) persistedPublicAttempts += 1;
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await completeCareerAnchors(page, "en");
  expect(analyzeRequests).toBe(0);
  expect(persistedPublicAttempts).toBe(0);
  await expect(page.getByRole("heading", { name: careerLabels.en.shareTitle })).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);

  const beforeTheme = await page.locator(".career-quiz").evaluate((element) => {
    const style = window.getComputedStyle(element);
    return `${style.backgroundColor}|${style.color}`;
  });
  await page.getByRole("button", { name: "Switch to dark mode" }).first().click();
  await expect.poll(() => page.locator("html").getAttribute("class")).toContain("dark");
  const afterTheme = await page.locator(".career-quiz").evaluate((element) => {
    const style = window.getComputedStyle(element);
    return `${style.backgroundColor}|${style.color}`;
  });
  expect(afterTheme).not.toBe(beforeTheme);
});
