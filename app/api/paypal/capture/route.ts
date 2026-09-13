import { checkoutRequest, ownedPayment, capturePayment, paymentResponse, paymentFailure } from "@/lib/paypal/payments";
import { PaymentError } from "@/lib/paypal/config";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const { auth, service } = await checkoutRequest(request);
    const payment = await ownedPayment(auth.user.id, service);
    if (!payment) throw new PaymentError("Pago no encontrado.", 404);
    if (payment.status !== "approved") await capturePayment(payment);
    return paymentResponse({ status: payment.status === "approved" ? "approved" : "pending" });
  } catch (error) { return paymentFailure(error); }
}
