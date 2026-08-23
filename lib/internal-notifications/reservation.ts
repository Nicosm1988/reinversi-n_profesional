import { randomUUID } from "node:crypto";

export const INTERNAL_NOTIFICATION_LEASE_SECONDS = 60;

export function createInternalNotificationLeaseToken() {
  return randomUUID();
}
