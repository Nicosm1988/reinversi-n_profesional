import "server-only";

export const processSlugs = [
  "brujula",
  "nueva-etapa-profesional",
] as const;

export type ProcessSlug = (typeof processSlugs)[number];

type ProcessDefinition = {
  slug: ProcessSlug;
  key: "compass" | "newStage";
  number: "01" | "02";
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
    slug: "brujula",
    key: "compass",
    number: "01",
    durationMeetings: 5,
    internalPriceUsd: null,
    accent: "olive",
    stageKeys: ["question", "signals", "worlds", "criteria", "alternatives", "direction"],
    takeawayKeys: ["signals", "map", "criteria", "alternatives", "plan"],
  },
  {
    slug: "nueva-etapa-profesional",
    key: "newStage",
    number: "02",
    durationMeetings: 7,
    internalPriceUsd: null,
    accent: "terracotta",
    stageKeys: ["moment", "trajectory", "identity", "criteria", "direction", "positioning", "strategy", "integrate"],
    takeawayKeys: ["trajectory", "strengths", "direction", "narrative", "positioning", "roadmap"],
  },
] as const satisfies readonly ProcessDefinition[];

export function getSendaProcess(slug: string) {
  return sendaProcesses.find((process) => process.slug === slug);
}
