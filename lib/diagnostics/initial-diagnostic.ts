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
