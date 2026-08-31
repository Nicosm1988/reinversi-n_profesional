import "server-only";

export const transitionServiceSlugs = [
  "explorar-direccion",
  "cambiar-empleo",
  "proyecto-propio",
  "liderazgo-empresa",
  "desafio-puntual",
  "elegir-formacion",
  "transicion-a-otro-rol",
] as const;

export type TransitionServiceSlug = (typeof transitionServiceSlugs)[number];

export const compassSlug = "brujulas" as const;
export type SendaProcessSlug = TransitionServiceSlug | typeof compassSlug;

export type SendaProcessKey =
  | "direction"
  | "jobChange"
  | "project"
  | "leadership"
  | "focused"
  | "education"
  | "roleTransition"
  | "compass";

export type SendaProcessDefinition = {
  slug: SendaProcessSlug;
  key: SendaProcessKey;
  number: "01" | "02" | "03" | "04" | "05" | "06" | "07" | "B";
  durationMeetings: number | null;
  stageKeys: readonly string[];
  takeawayKeys: readonly string[];
  accent: "olive" | "terracotta" | "charcoal";
  secondary?: boolean;
};

export const transitionServices = [
  {
    slug: "explorar-direccion",
    key: "direction",
    number: "01",
    durationMeetings: null,
    accent: "olive",
    stageKeys: ["identity", "interests", "experiences", "capital", "alternatives", "criteria", "direction"],
    takeawayKeys: ["identity", "capital", "alternatives", "criteria", "plan"],
  },
  {
    slug: "cambiar-empleo",
    key: "jobChange",
    number: "02",
    durationMeetings: null,
    accent: "terracotta",
    stageKeys: ["trajectory", "direction", "value", "narrative", "profile", "search", "conversations", "movement"],
    takeawayKeys: ["trajectory", "direction", "value", "profile", "strategy", "plan"],
  },
  {
    slug: "proyecto-propio",
    key: "project",
    number: "03",
    durationMeetings: null,
    accent: "charcoal",
    stageKeys: ["identity", "scope", "audience", "value", "priorities", "decisions", "structure", "reality", "nextSteps"],
    takeawayKeys: ["coherence", "scope", "value", "priorities", "validation", "plan"],
  },
  {
    slug: "liderazgo-empresa",
    key: "leadership",
    number: "04",
    durationMeetings: null,
    accent: "olive",
    stageKeys: ["solitude", "role", "boundaries", "conversations", "organization", "context", "strategy", "continuity", "integration"],
    takeawayKeys: ["role", "criteria", "conversations", "strategy", "continuity"],
  },
  {
    slug: "desafio-puntual",
    key: "focused",
    number: "05",
    durationMeetings: null,
    accent: "terracotta",
    stageKeys: ["problem", "information", "alternatives", "criteria", "decision", "action"],
    takeawayKeys: ["problem", "criteria", "decision", "action"],
  },
  {
    slug: "elegir-formacion",
    key: "education",
    number: "06",
    durationMeetings: null,
    accent: "charcoal",
    stageKeys: ["trajectory", "interests", "direction", "options", "timeInvestment", "technology", "comparison", "decision", "plan"],
    takeawayKeys: ["criteria", "options", "comparison", "decision", "plan"],
  },
  {
    slug: "transicion-a-otro-rol",
    key: "roleTransition",
    number: "07",
    durationMeetings: null,
    accent: "olive",
    stageKeys: ["currentRole", "motivation", "targetRole", "skills", "positioning", "conversations", "transition"],
    takeawayKeys: ["currentRole", "targetRole", "skills", "positioning", "conversations", "plan"],
  },
] as const satisfies readonly SendaProcessDefinition[];

export const compassProcess = {
  slug: compassSlug,
  key: "compass",
  number: "B",
  durationMeetings: 5,
  accent: "olive",
  secondary: true,
  stageKeys: [],
  takeawayKeys: [],
} as const satisfies SendaProcessDefinition;

export const sendaProcesses = [...transitionServices, compassProcess] as const;

export function getTransitionService(slug: string): SendaProcessDefinition | undefined {
  return transitionServices.find((service) => service.slug === slug);
}

export function getSendaProcess(slug: string): SendaProcessDefinition | undefined {
  return sendaProcesses.find((process) => process.slug === slug);
}
