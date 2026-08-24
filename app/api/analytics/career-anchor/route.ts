import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { careerAnchorAnalyticsEvents } from "@/lib/analytics/career-anchor";
import { getClientIp, getRequestId } from "@/lib/http/request-context";
import { readJsonBody } from "@/lib/http/json-body";
import { withRequestHeaders } from "@/lib/http/response-headers";
import { logEvent } from "@/lib/observability/logger";
import { limitRequest } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z
  .object({
    event: z.enum(careerAnchorAnalyticsEvents),
    journeyId: z.uuid(),
    locale: z.enum(["es", "en"]),
    statement: z.number().int().min(1).max(40).optional(),
    progress: z.number().int().min(0).max(100).optional(),
  })
  .strict();

export async function POST(req: Request) {
  const requestId = getRequestId(req);
  const headers = {
    ...withRequestHeaders(requestId),
    "Cache-Control": "no-store",
  };
  const rateLimit = await limitRequest({
    key: createHash("sha256").update(getClientIp(req)).digest("hex"),
    prefix: "analytics:career-anchor",
    limit: 200,
    windowMs: 30 * 60_000,
  });

  if (rateLimit.limited) {
    return new NextResponse(null, { status: 204, headers });
  }

  const body = await readJsonBody(req, 2_048);
  if (!body.ok) {
    return NextResponse.json({ ok: false }, { status: 400, headers });
  }

  const parsed = bodySchema.safeParse(body.value);
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400, headers });
  }

  logEvent("info", parsed.data.event, {
    requestId,
    journeyId: parsed.data.journeyId,
    locale: parsed.data.locale,
    statement: parsed.data.statement,
    progress: parsed.data.progress,
  });

  return new NextResponse(null, { status: 204, headers });
}
