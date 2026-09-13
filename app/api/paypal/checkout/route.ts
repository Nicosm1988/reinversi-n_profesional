import { checkoutRequest, startCheckout, paymentResponse, paymentFailure } from "@/lib/paypal/payments";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const { auth, service, locale, amount } = await checkoutRequest(request);
    return paymentResponse(await startCheckout(auth.user.id, service, locale, amount));
  } catch (error) { return paymentFailure(error); }
}
