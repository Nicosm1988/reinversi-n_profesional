export type SmtpDeliveryResult = {
  accepted?: unknown[];
  rejected?: unknown[];
};

export function smtpAcceptedDelivery(result: SmtpDeliveryResult) {
  return Array.isArray(result.accepted) && result.accepted.length > 0;
}
