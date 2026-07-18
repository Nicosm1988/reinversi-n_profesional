import { NextResponse } from "next/server";
import { getRequestId } from "@/lib/http/request-context";
import { withRequestHeaders } from "@/lib/http/response-headers";

export async function POST(req: Request) {
  const requestId = getRequestId(req);

  return NextResponse.json(
    {
      code: "ENDPOINT_RETIRED",
      error: "El diagnóstico se guarda de forma segura durante su procesamiento.",
    },
    { status: 410, headers: withRequestHeaders(requestId) },
  );
}
