import { notFound, redirect } from "next/navigation";
import { Link } from "@/navigation";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { PaymentError, paypalConfig, servicePrice, serviceSchema, services } from "@/lib/paypal/config";
import { paymentFields, type Payment } from "@/lib/paypal/payments";
import { PaypalCheckout } from "@/components/payments/paypal-checkout";

export const metadata = { title: "Pago seguro | Senda", robots: { index: false, follow: false } };
export default async function PaymentPage({ params, searchParams }: { params: Promise<{ locale: string; service: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { locale, service: slug } = await params;
  const parsed = serviceSchema.safeParse(slug);
  if (!parsed.success) notFound();
  const service = parsed.data;
  const auth = await getAuthenticatedUser();
  const prefix = locale === "en" ? "/en" : "";
  if (!auth.ok) redirect(`${prefix}/login?next=${encodeURIComponent(`${prefix}/pagos/${service}`)}`);
  let payment: Payment | null = null;
  let amount: string | null = null;
  let unavailable: string | null = null;
  try {
    const config = paypalConfig();
    // Use the user's RLS-scoped client for reading their persisted entitlement.
    const { data, error } = await auth.supabase.from("paypal_payments").select(paymentFields).eq("service", service).eq("environment", config.env).maybeSingle();
    if (error) throw new PaymentError("No pudimos consultar el estado del pago.");
    payment = data as Payment | null;
    amount = payment ? Number(payment.amount).toFixed(2) : servicePrice(service).amount;
  } catch (error) { unavailable = error instanceof PaymentError ? error.message : "El pago no está disponible. Contactá al equipo."; }
  const query = await searchParams;
  return <main className="mx-auto min-h-screen max-w-2xl space-y-8 px-6 pb-20 pt-32">
    <Link href="/panel" className="underline">{locale === "en" ? "Back to my account" : "Volver a mi cuenta"}</Link>
    <h1 className="font-heading text-3xl">{services[service]}</h1>
    <PaypalCheckout service={service} locale={locale} amount={amount} status={payment?.status ?? null} returned={query.retorno === "1"} cancelled={query.cancelado === "1"} unavailable={unavailable} />
    {payment?.status === "approved" && <section className="space-y-4 rounded-xl border p-6"><h2 className="text-xl font-semibold">{locale === "en" ? "Next step" : "Siguiente paso"}</h2><p>{locale === "en" ? "Contact the team to coordinate your service." : "Contactá al equipo para coordinar el inicio de tu servicio."}</p><Link className="underline" href="/contacto">{locale === "en" ? "Coordinate my service" : "Coordinar mi servicio"}</Link></section>}
  </main>;
}
