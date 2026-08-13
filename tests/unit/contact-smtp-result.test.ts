import { describe, expect, it } from "vitest";
import { smtpAcceptedDelivery } from "@/lib/contact/smtp-result";

describe("smtpAcceptedDelivery", () => {
  it("only reports success when SMTP accepted at least one recipient", () => {
    expect(smtpAcceptedDelivery({ accepted: ["hola@universosenda.com"], rejected: [] })).toBe(true);
    expect(smtpAcceptedDelivery({ accepted: [], rejected: ["hola@universosenda.com"] })).toBe(false);
    expect(smtpAcceptedDelivery({})).toBe(false);
  });
});
