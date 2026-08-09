import "server-only";

export const processSlugs = [
  "orientacion-vocacional",
  "reinvencion-profesional",
  "transicion-laboral",
] as const;

export type ProcessSlug = (typeof processSlugs)[number];

type ProcessDefinition = {
  slug: ProcessSlug;
  key: "orientation" | "reinvention" | "transition";
  number: "01" | "02" | "03";
  durationMeetings: number;
  internalPriceUsd: number | null;
  stageKeys: readonly string[];
  takeawayKeys: readonly string[];
  accent: "olive" | "terracotta" | "charcoal";
};

/**
 * Public process structure and private commercial configuration.
 * `internalPriceUsd` is intentionally never consumed by a UI component.
 */
export const sendaProcesses = [
  {
    slug: "orientacion-vocacional",
    key: "orientation",
    number: "01",
    durationMeetings: 5,
    internalPriceUsd: null,
    accent: "olive",
    stageKeys: ["name", "interests", "desires", "possibilities", "validate", "integrate"],
    takeawayKeys: ["map", "hypotheses", "alternatives", "questions", "plan"],
  },
  {
    slug: "reinvencion-profesional",
    key: "reinvention",
    number: "02",
    durationMeetings: 7,
    internalPriceUsd: 1500,
    accent: "terracotta",
    stageKeys: ["moment", "identity", "patterns", "criteria", "direction", "futures", "movement", "integrate"],
    takeawayKeys: ["trajectory", "strengths", "hypothesis", "narrative", "roadmap"],
  },
  {
    slug: "transicion-laboral",
    key: "transition",
    number: "03",
    durationMeetings: 7,
    internalPriceUsd: 1800,
    accent: "charcoal",
    stageKeys: ["understand", "objective", "movement", "execution", "positioning", "presence", "exposure", "continue"],
    takeawayKeys: ["strategy", "objective", "plan", "assets", "pitch", "networking"],
  },
] as const satisfies readonly ProcessDefinition[];

export function getSendaProcess(slug: string) {
  return sendaProcesses.find((process) => process.slug === slug);
}
