export type CareerAnchorJourneyStep =
  | "intro"
  | "ready"
  | "questions"
  | "transition"
  | "bonus"
  | "processing"
  | "results"
  | "completed";

export function getCareerAnchorInitialStep(
  status: "in_progress" | "processing" | "completed" | undefined,
  showStoredResult: boolean,
): CareerAnchorJourneyStep {
  if (status === "completed") return showStoredResult ? "results" : "completed";
  if (status === "processing" || status === "in_progress") return "ready";
  return "intro";
}
