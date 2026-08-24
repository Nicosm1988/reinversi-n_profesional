export const careerAnchorAnalyticsEvents = [
  "career_anchor_intro_viewed",
  "career_anchor_started",
  "career_anchor_statement_answered",
  "career_anchor_25_percent",
  "career_anchor_50_percent",
  "career_anchor_75_percent",
  "career_anchor_statements_completed",
  "career_anchor_final_selection_started",
  "career_anchor_final_selection_completed",
  "career_anchor_result_generated",
  "career_anchor_result_viewed",
  "career_anchor_resumed",
  "career_anchor_abandoned",
  "career_anchor_progress_saved",
  "career_anchor_contact_requested",
] as const;

export type CareerAnchorAnalyticsEvent = (typeof careerAnchorAnalyticsEvents)[number];

type CareerAnchorAnalyticsMetadata = {
  locale: "es" | "en";
  statement?: number;
  progress?: number;
};

const CAREER_ANCHOR_JOURNEY_ID_KEY = "senda_career_anchor_analytics_journey_v1";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getCareerAnchorJourneyId() {
  try {
    const existing = window.localStorage.getItem(CAREER_ANCHOR_JOURNEY_ID_KEY);
    if (existing && UUID_PATTERN.test(existing)) return existing;

    const created = window.crypto.randomUUID();
    window.localStorage.setItem(CAREER_ANCHOR_JOURNEY_ID_KEY, created);
    return created;
  } catch {
    return window.crypto.randomUUID();
  }
}

export function trackCareerAnchorEvent(
  event: CareerAnchorAnalyticsEvent,
  metadata: CareerAnchorAnalyticsMetadata,
  analyticsConsent: boolean,
) {
  if (!analyticsConsent || typeof window === "undefined") return;

  const journeyId = getCareerAnchorJourneyId();
  const eventPayload = { event, journeyId, ...metadata };

  window.dispatchEvent(
    new CustomEvent("senda:analytics", {
      detail: eventPayload,
    }),
  );

  void fetch("/api/analytics/career-anchor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(eventPayload),
    credentials: "same-origin",
    keepalive: true,
  }).catch(() => undefined);
}
