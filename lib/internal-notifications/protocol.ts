export const INTERNAL_NOTIFICATION_HEADER = "x-senda-notification";

export const INTERNAL_NOTIFICATION_HEADER_VALUES = {
  login: "login",
  anonymousCareerAnchorAttempt: "career-anchor-attempt-anonymous",
  anonymousCareerAnchorCompletion: "career-anchor-completed-anonymous",
  authenticatedCareerAnchorCompletion: "career-anchor-completed-authenticated",
} as const;
