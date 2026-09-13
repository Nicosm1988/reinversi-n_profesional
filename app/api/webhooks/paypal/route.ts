import { readJsonBody } from "@/lib/http/json-body";
import { processWebhook } from "@/lib/paypal/webhook";
import { paymentFailure, paymentResponse } from "@/lib/paypal/payments";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request, 131072);
    if (!body.ok) return paymentResponse({ error: "Evento inválido." }, 400);
    await processWebhook(request.headers, body.value);
    return paymentResponse({ received: true });
  } catch (error) { return paymentFailure(error); }
}
