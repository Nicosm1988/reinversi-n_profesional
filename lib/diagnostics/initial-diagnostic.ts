import { z } from "zod";

export const diagnosticSituations = [
  "choosing-direction",
  "trajectory-no-longer-represents-me",
  "concrete-work-change",
  "need-clarity",
] as const;

export const diagnosticNeeds = [
  "know-myself",
  "choose-alternatives",
  "redefine-direction",
  "organize-transition",
  "reposition-professionally",
  "move-again",
] as const;

export const diagnosticStages = [
  "secondary-school",
  "higher-education",
  "early-career",
  "experienced-professional",
  "leadership",
  "life-stage-change",
] as const;

export const diagnosticUrgencies = [
  "exploring",
  "move-soon",
  "short-term-decision",
  "urgent",
] as const;

export const suggestedRoutes = [
  "brujula",
  "nueva-etapa-profesional",
  "entrevista-admision-requerida",
] as const;

export type SuggestedRoute = (typeof suggestedRoutes)[number];

export const initialDiagnosticSchema = z
  .object({
    situation: z.enum(diagnosticSituations),
    need: z.enum(diagnosticNeeds),
    careerStage: z.enum(diagnosticStages),
    urgency: z.enum(diagnosticUrgencies),
    fullName: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(160).transform((value) => value.toLowerCase()),
    phone: z.string().trim().max(40).optional().transform((value) => value || undefined),
    consentAccepted: z.literal(true),
    sourcePage: z.string().trim().max(120).regex(/^\/[a-zA-Z0-9/_-]*$/).optional(),
    locale: z.enum(["es", "en"]).default("es"),
    captchaToken: z.string().trim().min(1).max(4096).optional(),
  })
  .strict();

export type InitialDiagnosticInput = z.infer<typeof initialDiagnosticSchema>;

export function suggestRoute(input: Pick<InitialDiagnosticInput, "situation" | "need" | "careerStage" | "urgency">): SuggestedRoute {
  if (input.urgency === "urgent") return "entrevista-admision-requerida";
  if (input.situation === "need-clarity") return "entrevista-admision-requerida";

  const compatibleNeeds: Record<Exclude<InitialDiagnosticInput["situation"], "need-clarity">, InitialDiagnosticInput["need"][]> = {
    "choosing-direction": ["know-myself", "choose-alternatives"],
    "trajectory-no-longer-represents-me": ["know-myself", "redefine-direction", "move-again"],
    "concrete-work-change": ["organize-transition", "reposition-professionally", "move-again"],
  };

  if (!compatibleNeeds[input.situation].includes(input.need)) {
    return "entrevista-admision-requerida";
  }

  if (input.situation === "choosing-direction") {
    return ["secondary-school", "higher-education", "early-career"].includes(input.careerStage)
      ? "brujula"
      : "entrevista-admision-requerida";
  }
  if (
    input.situation === "trajectory-no-longer-represents-me"
    || input.situation === "concrete-work-change"
  ) {
    return ["early-career", "experienced-professional", "leadership", "life-stage-change"].includes(input.careerStage)
      ? "nueva-etapa-profesional"
      : "entrevista-admision-requerida";
  }
  return "entrevista-admision-requerida";
}

export function toInitialDiagnosticInsert(input: InitialDiagnosticInput, userId: string | null) {
  return {
    user_id: userId,
    full_name: input.fullName,
    email: input.email,
    phone: input.phone ?? null,
    situation: input.situation,
    need: input.need,
    career_stage: input.careerStage,
    urgency: input.urgency,
    suggested_route: suggestRoute(input),
    routing_version: 2,
    form_version: 1,
    locale: input.locale,
    source_page: input.sourcePage ?? null,
    privacy_policy_version: "2026-08-02",
  };
}

/**
 * Public route finder.
 *
 * This model is intentionally separate from the legacy intake schema above.
 * The legacy API still compiles for historical records, while the public
 * questionnaire can calculate an orientation without contact data, CAPTCHA,
 * authentication or persistence.
 */
export const routeFinderSituations = [
  "direction",
  "jobChange",
  "project",
  "leadership",
  "focused",
  "education",
  "compass",
] as const;

export const routeFinderNeeds = [
  "identity",
  "search",
  "validate",
  "lead",
  "decide",
  "learn",
  "firstDecisions",
] as const;

export const routeFinderStages = [
  "secondary",
  "higher",
  "early",
  "experienced",
  "leadership",
  "owner",
  "life",
] as const;

export const routeFinderRouteIds = [
  "explorar-direccion",
  "cambiar-empleo",
  "proyecto-propio",
  "liderazgo-empresa",
  "desafio-puntual",
  "elegir-formacion",
  "brujulas",
] as const;

export type RouteFinderSituation = (typeof routeFinderSituations)[number];
export type RouteFinderNeed = (typeof routeFinderNeeds)[number];
export type RouteFinderStage = (typeof routeFinderStages)[number];
export type RouteFinderUrgency = (typeof diagnosticUrgencies)[number];
export type RouteFinderRouteId = (typeof routeFinderRouteIds)[number];
export type RouteFinderDimension = "situation" | "need" | "careerStage" | "urgency";

export type RouteFinderAnswers = {
  situation: RouteFinderSituation;
  need: RouteFinderNeed;
  careerStage: RouteFinderStage;
  urgency: RouteFinderUrgency;
};

export const routeFinderRoutes = {
  "explorar-direccion": {
    href: "/transiciones-laborales/explorar-direccion",
    messageKey: "exploreDirection",
    workOnKeys: ["identity", "significantExperience", "capital", "alternatives", "criteria"],
  },
  "cambiar-empleo": {
    href: "/transiciones-laborales/cambiar-empleo",
    messageKey: "changeJob",
    workOnKeys: ["trajectory", "direction", "value", "profile", "search"],
  },
  "proyecto-propio": {
    href: "/transiciones-laborales/proyecto-propio",
    messageKey: "ownProject",
    workOnKeys: ["identity", "scope", "audience", "viability", "nextSteps"],
  },
  "liderazgo-empresa": {
    href: "/transiciones-laborales/liderazgo-empresa",
    messageKey: "leadershipCompany",
    workOnKeys: ["role", "limits", "conversations", "organization", "continuity"],
  },
  "desafio-puntual": {
    href: "/transiciones-laborales/desafio-puntual",
    messageKey: "focusedChallenge",
    workOnKeys: ["problem", "information", "alternatives", "criteria", "plan"],
  },
  "elegir-formacion": {
    href: "/transiciones-laborales/elegir-formacion",
    messageKey: "chooseEducation",
    workOnKeys: ["trajectory", "interests", "time", "investment", "context"],
  },
  brujulas: {
    href: "/brujulas",
    messageKey: "compasses",
    workOnKeys: ["interests", "options", "education", "work", "criteria"],
  },
} as const satisfies Record<
  RouteFinderRouteId,
  {
    href: string;
    messageKey: string;
    workOnKeys: readonly string[];
  }
>;

type RouteWeights = Partial<Record<RouteFinderRouteId, number>>;

const situationWeights: Record<RouteFinderSituation, RouteWeights> = {
  direction: { "explorar-direccion": 7 },
  jobChange: { "cambiar-empleo": 7 },
  project: { "proyecto-propio": 7 },
  leadership: { "liderazgo-empresa": 7 },
  focused: { "desafio-puntual": 7 },
  education: { "elegir-formacion": 7 },
  compass: { brujulas: 7 },
};

const needWeights: Record<RouteFinderNeed, RouteWeights> = {
  identity: { "explorar-direccion": 4, brujulas: 2 },
  search: { "cambiar-empleo": 4, "explorar-direccion": 1 },
  validate: { "proyecto-propio": 4, "desafio-puntual": 2 },
  lead: { "liderazgo-empresa": 4, "desafio-puntual": 1 },
  decide: { "desafio-puntual": 4, "explorar-direccion": 2 },
  learn: { "elegir-formacion": 4, "explorar-direccion": 1, brujulas: 1 },
  firstDecisions: { brujulas: 5, "elegir-formacion": 2 },
};

const stageWeights: Record<RouteFinderStage, RouteWeights> = {
  secondary: { brujulas: 5, "elegir-formacion": 1 },
  higher: { brujulas: 3, "elegir-formacion": 3, "explorar-direccion": 1 },
  early: { "explorar-direccion": 2, "cambiar-empleo": 2, "elegir-formacion": 1, brujulas: 1 },
  experienced: { "explorar-direccion": 2, "cambiar-empleo": 2, "proyecto-propio": 1, "desafio-puntual": 1 },
  leadership: { "liderazgo-empresa": 4, "desafio-puntual": 1, "cambiar-empleo": 1 },
  owner: { "liderazgo-empresa": 3, "proyecto-propio": 3, "desafio-puntual": 1 },
  life: { "explorar-direccion": 3, "elegir-formacion": 1, "proyecto-propio": 1 },
};

const urgencyWeights: Record<RouteFinderUrgency, RouteWeights> = {
  exploring: { "explorar-direccion": 1, "elegir-formacion": 1, brujulas: 1 },
  "move-soon": { "cambiar-empleo": 1, "proyecto-propio": 1 },
  "short-term-decision": { "desafio-puntual": 2, "cambiar-empleo": 1, "elegir-formacion": 1 },
  urgent: {},
};

const directRouteBySituation: Record<RouteFinderSituation, RouteFinderRouteId> = {
  direction: "explorar-direccion",
  jobChange: "cambiar-empleo",
  project: "proyecto-propio",
  leadership: "liderazgo-empresa",
  focused: "desafio-puntual",
  education: "elegir-formacion",
  compass: "brujulas",
};

export type RouteFinderSignal = {
  dimension: RouteFinderDimension;
  value: string;
  weight: number;
};

export type RouteFinderRouteResult = {
  id: RouteFinderRouteId;
  href: (typeof routeFinderRoutes)[RouteFinderRouteId]["href"];
  messageKey: (typeof routeFinderRoutes)[RouteFinderRouteId]["messageKey"];
  workOnKeys: readonly string[];
  score: number;
};

export type RouteFinderResult = {
  routingVersion: 3;
  answers: RouteFinderAnswers;
  primary: RouteFinderRouteResult;
  secondary: RouteFinderRouteResult | null;
  scores: Record<RouteFinderRouteId, number>;
  signals: RouteFinderSignal[];
  urgentHumanContact: boolean;
};

export type ShareableDiagnosticResult = RouteFinderResult & {
  instrument: "senda-route-finder";
  locale: "es" | "en";
  completedAt: string;
};

function emptyRouteScores(): Record<RouteFinderRouteId, number> {
  return {
    "explorar-direccion": 0,
    "cambiar-empleo": 0,
    "proyecto-propio": 0,
    "liderazgo-empresa": 0,
    "desafio-puntual": 0,
    "elegir-formacion": 0,
    brujulas: 0,
  };
}

function addWeights(scores: Record<RouteFinderRouteId, number>, weights: RouteWeights) {
  for (const routeId of routeFinderRouteIds) {
    scores[routeId] += weights[routeId] ?? 0;
  }
}

function toRouteResult(
  id: RouteFinderRouteId,
  score: number,
): RouteFinderRouteResult {
  const route = routeFinderRoutes[id];
  return {
    id,
    href: route.href,
    messageKey: route.messageKey,
    workOnKeys: route.workOnKeys,
    score,
  };
}

export function calculateRouteFinderResult(answers: RouteFinderAnswers): RouteFinderResult {
  const scores = emptyRouteScores();
  addWeights(scores, situationWeights[answers.situation]);
  addWeights(scores, needWeights[answers.need]);
  addWeights(scores, stageWeights[answers.careerStage]);
  addWeights(scores, urgencyWeights[answers.urgency]);

  const directRoute = directRouteBySituation[answers.situation];
  const ranked = routeFinderRouteIds
    .map((id, catalogOrder) => ({ id, score: scores[id], catalogOrder }))
    .sort((left, right) => {
      const scoreDifference = right.score - left.score;
      if (scoreDifference !== 0) return scoreDifference;
      if (left.id === directRoute) return -1;
      if (right.id === directRoute) return 1;
      return left.catalogOrder - right.catalogOrder;
    });

  const primaryRank = ranked[0];
  if (!primaryRank) {
    throw new Error("Route finder catalog is empty.");
  }

  const secondaryRank = ranked[1];
  const secondaryIsClose = Boolean(
    secondaryRank
      && secondaryRank.score >= 7
      && primaryRank.score - secondaryRank.score <= 2,
  );

  const primaryId = primaryRank.id;
  const scoredSignals: RouteFinderSignal[] = [
    {
      dimension: "situation",
      value: answers.situation,
      weight: situationWeights[answers.situation][primaryId] ?? 0,
    },
    {
      dimension: "need",
      value: answers.need,
      weight: needWeights[answers.need][primaryId] ?? 0,
    },
    {
      dimension: "careerStage",
      value: answers.careerStage,
      weight: stageWeights[answers.careerStage][primaryId] ?? 0,
    },
    {
      dimension: "urgency",
      value: answers.urgency,
      weight: urgencyWeights[answers.urgency][primaryId] ?? 0,
    },
  ];
  const signals = scoredSignals
    .filter((signal) => signal.weight > 0)
    .sort((left, right) => right.weight - left.weight)
    .slice(0, 3);

  return {
    routingVersion: 3,
    answers,
    primary: toRouteResult(primaryId, primaryRank.score),
    secondary: secondaryIsClose && secondaryRank
      ? toRouteResult(secondaryRank.id, secondaryRank.score)
      : null,
    scores,
    signals,
    urgentHumanContact: answers.urgency === "urgent",
  };
}

export function toShareableDiagnosticResult(
  result: RouteFinderResult,
  locale: "es" | "en",
  completedAt = new Date().toISOString(),
): ShareableDiagnosticResult {
  return {
    ...result,
    instrument: "senda-route-finder",
    locale,
    completedAt,
  };
}
