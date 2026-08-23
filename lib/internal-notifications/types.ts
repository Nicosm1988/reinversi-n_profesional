export type InternalActivityType = "login" | "career_anchor_completed";

export type InternalActivityAudience = "authenticated" | "anonymous";

export type InternalActivityInput = {
  type: InternalActivityType;
  eventId: string;
  occurredAt: Date;
  audience: InternalActivityAudience;
};

export type InternalNotificationFailureCode =
  | "configuration"
  | "invalid_input"
  | "outbox_unavailable"
  | "recipient_unavailable"
  | "smtp_rejected"
  | "smtp_transport"
  | "unexpected";

export type InternalNotificationRecipientKey = `recipient-${string}`;

export type InternalNotificationDelivery = {
  recipientKey: InternalNotificationRecipientKey;
  status: "sent" | "duplicate" | "failed";
  reservationBackend: "redis" | null;
  errorCode?: InternalNotificationFailureCode;
  queued?: boolean;
};

export type InternalNotificationResult = {
  sent: number;
  duplicates: number;
  failed: number;
  unavailable: boolean;
  errorCode?: InternalNotificationFailureCode;
  deliveries: InternalNotificationDelivery[];
};

export type ProcessInternalNotificationOutboxOptions = {
  maxDeliveries?: number;
  deliveryIds?: string[];
};
