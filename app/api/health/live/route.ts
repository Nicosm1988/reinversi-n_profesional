import { NextResponse } from "next/server";
import { getRequestId } from "@/lib/http/request-context";

export async function GET(req: Request) {
  const requestId = getRequestId(req);

  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        "x-request-id": requestId,
        "cache-control": "no-store",
      },
    },
  );
}
