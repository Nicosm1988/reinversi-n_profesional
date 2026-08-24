import { NextResponse } from "next/server";
import { getRequestId } from "@/lib/http/request-context";
import { withRequestHeaders } from "@/lib/http/response-headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const requestId = getRequestId(req);

  return NextResponse.json(
    {
      error: "This diagnostic endpoint has been retired.",
      code: "endpoint_retired",
      replacement: "/api/diagnostics/interpret",
    },
    {
      status: 410,
      headers: {
        ...withRequestHeaders(requestId),
        "Cache-Control": "no-store",
      },
    },
  );
}
