import { z } from "zod";

const email = z.string().trim().email().max(160).transform((value) => value.toLowerCase());
const fullName = z.string().trim().min(2).max(120);
const sourcePage = z
  .string()
  .trim()
  .max(120)
  .regex(/^\/[a-zA-Z0-9/_-]*$/)
  .optional();
const commonFields = {
  email,
  sourcePage,
  locale: z.enum(["es", "en"]).optional(),
  consentAccepted: z.literal(true),
  captchaToken: z.string().trim().min(1).max(4096).optional(),
};

export const createLeadSchema = z.discriminatedUnion("type", [
  z
    .object({
      ...commonFields,
      type: z.literal("contact"),
      fullName,
      reason: z.string().trim().min(2).max(200),
      message: z.string().trim().min(2).max(5000),
    })
    .strict(),
  z
    .object({
      ...commonFields,
      type: z.literal("newsletter"),
      metadata: z.object({ channel: z.literal("footer-newsletter") }).strict().optional(),
    })
    .strict(),
  z
    .object({
      ...commonFields,
      type: z.literal("therapy"),
      fullName,
      reason: z.literal("therapy_modal").optional(),
      metadata: z.object({ channel: z.literal("therapy-modal") }).strict().optional(),
    })
    .strict(),
]);

export type CreateLead = z.infer<typeof createLeadSchema>;

export function toLeadInsert(payload: CreateLead, userId: string | null) {
  return {
    user_id: userId,
    lead_type: payload.type,
    full_name: "fullName" in payload ? payload.fullName : null,
    email: payload.email,
    reason: "reason" in payload ? (payload.reason ?? null) : null,
    message: "message" in payload ? payload.message : null,
    source_page: payload.sourcePage ?? null,
    locale: payload.locale ?? "es",
    metadata: "metadata" in payload ? (payload.metadata ?? {}) : {},
  };
}
