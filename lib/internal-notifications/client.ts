import {
  INTERNAL_NOTIFICATION_HEADER,
  INTERNAL_NOTIFICATION_HEADER_VALUES,
} from "@/lib/internal-notifications/protocol";

type AnonymousCareerAnchorCompletionInput = {
  locale: "es" | "en";
  completedQuestions: 40;
  selectedPriorities: 3;
};

async function postInternalNotification(
  path: string,
  headerValue: string,
  body?: unknown,
) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(path, {
        method: "POST",
        credentials: "same-origin",
        keepalive: true,
        headers: {
          [INTERNAL_NOTIFICATION_HEADER]: headerValue,
          ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });

      if (response.ok) return true;
      if (response.status < 500) return false;
    } catch {
      // The event endpoint is idempotent, so one short retry is safe.
    }
  }

  return false;
}

export function requestLoginNotification() {
  return postInternalNotification(
    "/api/internal-notifications/login",
    INTERNAL_NOTIFICATION_HEADER_VALUES.login,
  );
}

export function requestAnonymousCareerAnchorAttempt() {
  return postInternalNotification(
    "/api/internal-notifications/career-anchor-attempt",
    INTERNAL_NOTIFICATION_HEADER_VALUES.anonymousCareerAnchorAttempt,
  );
}

export function requestAnonymousCareerAnchorCompletionNotification(
  input: AnonymousCareerAnchorCompletionInput,
) {
  return postInternalNotification(
    "/api/internal-notifications/career-anchor-completed",
    INTERNAL_NOTIFICATION_HEADER_VALUES.anonymousCareerAnchorCompletion,
    input,
  );
}

export function requestAuthenticatedCareerAnchorCompletionNotification() {
  return postInternalNotification(
    "/api/internal-notifications/career-anchor-completed-authenticated",
    INTERNAL_NOTIFICATION_HEADER_VALUES.authenticatedCareerAnchorCompletion,
  );
}
