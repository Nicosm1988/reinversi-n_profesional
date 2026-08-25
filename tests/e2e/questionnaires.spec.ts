import { expect, test, type Page } from "@playwright/test";
import englishQuizData from "@/lib/data/anchors.en.json";
import spanishQuizData from "@/lib/data/anchors.json";

const authenticatedStorageState = process.env.E2E_AUTH_STORAGE_STATE;

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
    introTitle: "Las motivaciones detrás de tus decisiones profesionales",
    statementCount: "40 enunciados",
    loginCta: "Ingresar con Google para continuar",
    accountNote: "Para cuidar el intento único, el progreso y el resultado, necesitás ingresar con tu cuenta de Google.",
    introCta: "Continuar",
    readyCta: "Empezar el test",
    internalNoticeTitle: "Cómo recibe Senda tu resultado",
    statementNext: "Siguiente",
    statementFinish: "Completar los 40 enunciados",
    transitionCta: "Hacer mi selección final",
    selectionNext: "Página siguiente",
    selectionFinish: "Confirmar y ver mi resultado",
    result: "Tu mapa de anclas de carrera",
    tie: "Ancla principal compartida",
    progress: "Progreso general",
    topThree: "Estas son tus 3 anclas principales",
    contextLabel: "¿Qué situación profesional estás atravesando?",
    contextButton: "Preparar mi lectura orientativa",
    shareTitle: "Quiero conversar con Senda sobre mi resultado",
    shareSubmit: "Pedir contacto",
  },
  en: {
    route: "/en/test-anclas-de-carrera",
    introTitle: "The motivations behind your career decisions",
    statementCount: "40 statements",
    loginCta: "Sign in with Google to continue",
    accountNote: "To protect the single attempt, progress, and result, you need to sign in with your Google account.",
    introCta: "Continue",
    readyCta: "Start the test",
    internalNoticeTitle: "How Senda receives your result",
    statementNext: "Next",
    statementFinish: "Complete the 40 statements",
    transitionCta: "Make my final selection",
    selectionNext: "Next page",
    selectionFinish: "Confirm and view my result",
    result: "Your career anchor map",
    tie: "Shared primary anchor",
    progress: "Overall progress",
    topThree: "These are your 3 primary anchors",
    contextLabel: "What professional situation are you navigating?",
    contextButton: "Prepare my initial interpretation",
    shareTitle: "I want to talk with Senda about my result",
    shareSubmit: "Request contact",
  },
} as const;

test.describe("anonymous Career Anchors entry", () => {
  for (const locale of ["es", "en"] as const) {
    test(`shows only the ${locale} introduction and Google sign-in path`, async ({ page }) => {
      const labels = careerLabels[locale];
      const mutationRequests: string[] = [];
      page.on("request", (request) => {
        if (
          request.method() === "POST"
          && /\/api\/diagnostics\/(?:progress|complete-public|interpret)$/.test(
            new URL(request.url()).pathname,
          )
        ) {
          mutationRequests.push(new URL(request.url()).pathname);
        }
      });

      await page.goto(labels.route);

      await expect(page.getByRole("heading", { level: 1, name: labels.introTitle })).toBeVisible();
      await expect(page.getByText(labels.statementCount, { exact: true })).toBeVisible();
      await expect(page.getByText(labels.accountNote, { exact: true })).toBeVisible();
      const login = page.getByRole("link", { name: labels.loginCta, exact: true });
      await expect(login).toBeVisible();
      await expect(login).toHaveAttribute(
        "href",
        new RegExp(`/login\\?next=${encodeURIComponent(labels.route).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`),
      );
      await expect(page.locator('input[name^="statement-"]')).toHaveCount(0);
      await expect(page.locator("#career-anchor-result-email-consent")).toHaveCount(0);
      await expect(
        page.getByRole("heading", { name: labels.internalNoticeTitle, exact: true }),
      ).toHaveCount(0);
      await expect(page.locator(".career-quiz")).not.toContainText(
        /hola@universosenda\.com|tanisardella@gmail\.com/i,
      );
      await expect(page.getByTestId("career-anchor-final-dialog")).toHaveCount(0);
      await expect(page.getByRole("heading", { name: labels.result, exact: true })).toHaveCount(0);
      expect(mutationRequests).toEqual([]);
    });
  }
});

function interpretationFixture(locale: CareerLocale) {
  return {
    mode: "ai",
    title: locale === "es" ? "Una lectura asistida posible" : "A possible assisted reading",
    summary:
      locale === "es"
        ? "La competencia técnica aparece como referencia sin definir por sí sola una decisión."
        : "Technical competence appears as a reference point without defining a decision on its own.",
    tensions: [],
    reflectionQuestions:
      locale === "es"
        ? ["¿Qué querés preservar?", "¿Qué falta hoy?", "¿Qué podrías probar?"]
        : ["What do you want to preserve?", "What is missing today?", "What could you test?"],
    stageConnection:
      locale === "es"
        ? "Tu momento profesional puede compararse con estos criterios."
        : "Your current career stage can be compared against these criteria.",
    relevantServices: [
      {
        slug: "/transiciones-laborales/cambiar-empleo",
        label: locale === "es" ? "Preparar un cambio de empleo" : "Prepare for a job change",
        reason:
          locale === "es"
            ? "Permite ordenar alternativas sin convertir el resultado en una prescripción."
            : "It helps organize alternatives without turning the result into a prescription.",
      },
    ],
    nextSteps:
      locale === "es"
        ? ["Revisar experiencias.", "Comparar una alternativa.", "Definir un experimento pequeño."]
        : ["Review experiences.", "Compare one alternative.", "Define a small experiment."],
  };
}

async function mockAuthenticatedCareerApis(page: Page, locale: CareerLocale) {
  const progressPayloads: Record<string, unknown>[] = [];
  const completionPayloads: Record<string, unknown>[] = [];
  const interpretationPayloads: Record<string, unknown>[] = [];

  await page.route("**/api/diagnostics/progress", async (route) => {
    const payload = route.request().postDataJSON() as Record<string, unknown>;
    progressPayloads.push(payload);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        savedAt: "2026-08-24T12:00:00.000Z",
        revision: payload.clientRevision,
        accepted: true,
      }),
    });
  });
  await page.route("**/api/diagnostics/complete-public", async (route) => {
    completionPayloads.push(route.request().postDataJSON() as Record<string, unknown>);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });
  await page.route("**/api/diagnostics/interpret", async (route) => {
    interpretationPayloads.push(route.request().postDataJSON() as Record<string, unknown>);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(interpretationFixture(locale)),
    });
  });

  return { progressPayloads, completionPayloads, interpretationPayloads };
}

async function completeCareerAnchors(page: Page, locale: CareerLocale, keyboardBonus = false) {
  const labels = careerLabels[locale];
  const quizData = locale === "en" ? englishQuizData : spanishQuizData;
  await page.goto(labels.route);
  await expect(page).not.toHaveURL(/\/login/);
  await expect(page.locator('iframe[src*="challenges.cloudflare.com"]')).toHaveCount(0);
  const introHeading = page.getByRole("heading", { level: 1, name: labels.introTitle });
  test.skip(
    !(await introHeading.isVisible()),
    "The authenticated storage-state fixture already has saved Career Anchor progress or a completed result.",
  );
  await expect(page.getByRole("link", { name: labels.loginCta, exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: labels.introCta, exact: true }).click();
  await expect(
    page.getByRole("heading", { name: labels.internalNoticeTitle, exact: true }),
  ).toHaveCount(0);
  await expect(page.locator("#career-anchor-result-email-consent")).toHaveCount(0);
  await expect(page.locator(".career-quiz")).not.toContainText(
    /hola@universosenda\.com|tanisardella@gmail\.com/i,
  );
  await page.getByRole("button", { name: labels.readyCta, exact: true }).click();

  await expect(page.getByTestId("career-anchor-statement")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ),
  ).toBeLessThanOrEqual(1);

  const progress = page.getByRole("progressbar", { name: labels.progress });
  for (let questionId = 1; questionId <= 40; questionId += 1) {
    const score = questionId === 9 || questionId === 10 ? 2 : 1;
    await expect(progress).toHaveAttribute("aria-valuenow", String(questionId));
    const answer = page.locator(`input[name="statement-${questionId}"][value="${score}"]`);
    await answer.locator("..").click();
    await expect(answer).toBeChecked();
    const next = page.getByRole("button", {
      name: questionId === 40 ? labels.statementFinish : labels.statementNext,
      exact: true,
    });
    await expect(next).toBeEnabled();
    await next.click();
  }

  const finalDialog = page.getByTestId("career-anchor-final-dialog");
  await expect(finalDialog).toBeVisible();
  await finalDialog.getByRole("button", { name: labels.transitionCta, exact: true }).click();
  const selectionList = page.getByTestId("career-anchor-selection-list");
  await expect(selectionList.locator('input[type="checkbox"]')).toHaveCount(10);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ),
  ).toBeLessThanOrEqual(1);
  const bonusQuestions = quizData.questions.slice(0, 3);
  for (const [index, question] of bonusQuestions.entries()) {
    const option = page
      .getByTestId(`career-anchor-selection-${question.id}`)
      .locator('input[type="checkbox"]');
    if (index === 0 && keyboardBonus) {
      await option.focus();
      await page.keyboard.press("Space");
    } else {
      await option.locator("..").click();
    }
    await expect(option).toBeChecked();
  }

  for (let pageNumber = 1; pageNumber < 4; pageNumber += 1) {
    await finalDialog.getByRole("button", { name: labels.selectionNext, exact: true }).click();
  }
  await finalDialog.getByRole("button", { name: labels.selectionFinish, exact: true }).click();

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

test.describe("authenticated Career Anchors journey", () => {
  test.skip(
    !authenticatedStorageState,
    "E2E_AUTH_STORAGE_STATE is required for authenticated Career Anchor coverage.",
  );
  test.use({ storageState: authenticatedStorageState || undefined });

test("real Supabase journey persists, resumes, completes once and reopens the saved result", async ({ page }) => {
  test.skip(
    process.env.E2E_REAL_SUPABASE !== "1",
    "E2E_REAL_SUPABASE=1 is required for the stateful Supabase integration journey.",
  );
  test.setTimeout(240_000);
  const labels = careerLabels.es;
  const answers = Object.fromEntries(
    Array.from({ length: 40 }, (_, index) => [String(index + 1), (index % 6) + 1]),
  );

  await page.goto(labels.route);
  await expect(page.getByRole("heading", { level: 1, name: labels.introTitle })).toBeVisible();
  await page.getByRole("button", { name: labels.introCta, exact: true }).click();
  await expect(
    page.getByRole("heading", { name: labels.internalNoticeTitle, exact: true }),
  ).toHaveCount(0);
  await expect(page.locator("#career-anchor-result-email-consent")).toHaveCount(0);
  await expect(page.locator(".career-quiz")).not.toContainText(
    /hola@universosenda\.com|tanisardella@gmail\.com/i,
  );
  await page.getByRole("button", { name: labels.readyCta, exact: true }).click();

  for (let statementId = 1; statementId <= 14; statementId += 1) {
    const value = answers[String(statementId)];
    await page.locator(`input[name="statement-${statementId}"][value="${value}"]`).locator("..").click();
    if (statementId < 14) {
      await page.getByRole("button", { name: labels.statementNext, exact: true }).click();
    }
  }
  await expect(page.getByText("Avance guardado", { exact: true })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "Tu recorrido sigue guardado" })).toBeVisible();
  await expect(page.getByText(/retomar desde el enunciado 14/i)).toBeVisible();
  await page.getByRole("button", { name: "Retomar en el enunciado 14", exact: true }).click();
  await expect(page.locator(`input[name="statement-14"][value="${answers["14"]}"]`)).toBeChecked();
  await page.getByRole("button", { name: labels.statementNext, exact: true }).click();

  for (let statementId = 15; statementId <= 40; statementId += 1) {
    const value = answers[String(statementId)];
    await page.locator(`input[name="statement-${statementId}"][value="${value}"]`).locator("..").click();
    if (statementId < 40) {
      await page.getByRole("button", {
        name: labels.statementNext,
        exact: true,
      }).click();
    }
  }

  await expect(page.getByText("Avance guardado", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "Tu recorrido sigue guardado" })).toBeVisible();
  await page.getByRole("button", { name: "Retomar en el enunciado 40", exact: true }).click();
  await expect(page.locator(`input[name="statement-40"][value="${answers["40"]}"]`)).toBeChecked();
  await page.getByRole("button", { name: labels.statementFinish, exact: true }).click();

  const dialog = page.getByTestId("career-anchor-final-dialog");
  await dialog.getByRole("button", { name: labels.transitionCta, exact: true }).click();
  for (const statementId of [1, 2, 3]) {
    await page
      .getByTestId(`career-anchor-selection-${statementId}`)
      .locator('input[type="checkbox"]')
      .locator("..")
      .click();
  }
  for (let selectionPage = 1; selectionPage < 4; selectionPage += 1) {
    await dialog.getByRole("button", { name: labels.selectionNext, exact: true }).click();
  }
  await dialog.getByRole("button", { name: labels.selectionFinish, exact: true }).click();

  await expect(page.getByRole("heading", { level: 1, name: labels.result })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Una lectura para seguir explorando" })).toBeVisible();

  const duplicateCompletion = await page.evaluate(async (payload) => {
    const response = await fetch("/api/diagnostics/complete-public", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return { status: response.status, body: await response.json() };
  }, {
    rawAnswers: { answers, bonus: [1, 2, 3] },
    locale: "es",
    careerStage: "prefer_not_to_say",
  });
  expect(duplicateCompletion).toMatchObject({
    status: 409,
    body: { code: "already_completed" },
  });

  await page.goto(labels.route);
  await expect(page.getByRole("heading", { level: 1, name: "Este recorrido ya forma parte de tu perfil" })).toBeVisible();
  await expect(page.getByRole("button", { name: labels.readyCta, exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Volver a ver mi resultado", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1, name: labels.result })).toBeVisible();

  await page.goto("/panel#resultado");
  await expect(page.getByRole("heading", { name: "Mis Anclas de Carrera", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /ver resultado completo/i })).toBeVisible();
});

test("final selection remains usable at every required viewport", async ({ page }, testInfo) => {
  test.setTimeout(240_000);
  const labels = careerLabels.es;
  await mockAuthenticatedCareerApis(page, "es");
  await page.setViewportSize({ width: 1720, height: 900 });
  await page.goto(labels.route);
  await page.getByRole("button", { name: labels.introCta, exact: true }).click();
  await page.getByRole("button", { name: labels.readyCta, exact: true }).click();

  for (let statementId = 1; statementId <= 40; statementId += 1) {
    const answer = page.locator(`input[name="statement-${statementId}"][value="1"]`);
    await answer.locator("..").click();
    await page.getByRole("button", {
      name: statementId === 40 ? labels.statementFinish : labels.statementNext,
      exact: true,
    }).click();
  }

  const dialog = page.getByTestId("career-anchor-final-dialog");
  await dialog.getByRole("button", { name: labels.transitionCta, exact: true }).click();
  for (const statementId of [1, 2, 3]) {
    await page
      .getByTestId(`career-anchor-selection-${statementId}`)
      .locator('input[type="checkbox"]')
      .locator("..")
      .click();
  }

  const viewports = [
    { name: "desktop-large", width: 1720, height: 900 },
    { name: "notebook", width: 1366, height: 768 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "mobile", width: 390, height: 844 },
    { name: "mobile-small", width: 320, height: 568 },
  ] as const;

  for (const [index, viewport] of viewports.entries()) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await expect(dialog, viewport.name).toBeVisible();
    await expect(page.getByTestId("career-anchor-selection-count"), viewport.name).toContainText("3");
    await expect(page.getByTestId("career-anchor-selection-list").locator("label"), viewport.name).toHaveCount(10);
    const horizontalOverflow = await page.evaluate(
      () => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth,
    );
    expect(horizontalOverflow, `${viewport.name} horizontal overflow`).toBeLessThanOrEqual(1);

    const nextAction = index < 3
      ? dialog.getByRole("button", { name: labels.selectionNext, exact: true })
      : dialog.getByRole("button", { name: labels.selectionFinish, exact: true });
    await nextAction.scrollIntoViewIfNeeded();
    await expect(nextAction, `${viewport.name} final controls`).toBeVisible();
    const actionBox = await nextAction.boundingBox();
    expect(actionBox?.height ?? 0, `${viewport.name} action target`).toBeGreaterThanOrEqual(44);

    if (process.env.E2E_CAPTURE_RESPONSIVE === "1") {
      await page.screenshot({
        path: testInfo.outputPath(`career-anchor-selection-${viewport.name}.png`),
        fullPage: false,
      });
    }

    if (index < 3) await nextAction.click();
  }
});

test("complete Spanish Career Anchors flow breaks ties into unique positions, auto-generates a reading and allows consented sharing", async ({ page }) => {
  test.slow();
  let analyzeRequests = 0;
  const contactSubmissions: Record<string, unknown>[] = [];
  let contactAttempts = 0;
  const careerApi = await mockAuthenticatedCareerApis(page, "es");

  page.on("request", (request) => {
    if (request.url().endsWith("/api/diagnostics/analyze")) analyzeRequests += 1;
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
  expect(careerApi.progressPayloads.length).toBeGreaterThan(40);
  expect(careerApi.completionPayloads).toHaveLength(1);
  expect(contactAttempts).toBe(0);

  await expect(page.getByRole("heading", { name: "Una lectura asistida posible" })).toBeVisible();
  await expect(page.locator(".career-quiz").getByRole("link", { name: /Preparar un cambio de empleo/ })).toHaveAttribute(
    "href",
    "/transiciones-laborales/cambiar-empleo",
  );
  expect(careerApi.interpretationPayloads).toEqual([{}]);
  expect(careerApi.completionPayloads[0]).toEqual({
    rawAnswers: {
      answers: expect.objectContaining({ "1": 1, "9": 2, "10": 2, "40": 1 }),
      bonus: [1, 2, 3],
    },
    careerStage: "prefer_not_to_say",
    locale: "es",
  });
  expect(careerApi.completionPayloads[0]).not.toHaveProperty("name");
  expect(careerApi.completionPayloads[0]).not.toHaveProperty("email");
  expect(careerApi.completionPayloads[0]).not.toHaveProperty("phone");
  expect(careerApi.completionPayloads[0]).not.toHaveProperty("ranking");
  expect(careerApi.completionPayloads[0]).not.toHaveProperty("dominantResult");
  expect(careerApi.completionPayloads[0]).not.toHaveProperty("resultBase");

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
    formOrigin: "career_anchor_contact",
    name: "Grace Hopper",
    email: "grace@example.com",
    preferredContact: "email",
    consent: true,
    sourcePage: "/test-anclas-de-carrera",
    locale: "es",
  });
  expect(contactSubmissions[0]).not.toHaveProperty("result");
  expect(JSON.stringify(contactSubmissions[0])).not.toMatch(
    /primaryAnchors|secondaryAnchors|recommendedService|alternativeService|summary/i,
  );
});

test("complete English Career Anchors flow remains usable, themed and overflow-free on mobile", async ({ page }) => {
  test.slow();
  let analyzeRequests = 0;
  const careerApi = await mockAuthenticatedCareerApis(page, "en");
  page.on("request", (request) => {
    if (request.url().endsWith("/api/diagnostics/analyze")) analyzeRequests += 1;
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await completeCareerAnchors(page, "en");
  expect(analyzeRequests).toBe(0);
  expect(careerApi.progressPayloads.length).toBeGreaterThan(40);
  expect(careerApi.completionPayloads).toHaveLength(1);
  expect(careerApi.interpretationPayloads).toEqual([{}]);
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
});
