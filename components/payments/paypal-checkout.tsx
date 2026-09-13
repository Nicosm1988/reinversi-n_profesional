"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Props = { service: string; locale: string; amount: string | null; status: string | null; returned: boolean; cancelled: boolean; unavailable: string | null };
export function PaypalCheckout({ service, locale, amount, status, returned, cancelled, unavailable }: Props) {
  const router = useRouter();
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [waiting, setWaiting] = useState(false);
  const approved = status === "approved";
  const en = locale === "en";
  const pending = !approved && (waiting || returned || status === "pending");
  useEffect(() => {
    if (!pending) return;
    let count = 0;
    const timer = setInterval(() => { router.refresh(); if (++count >= 12) clearInterval(timer); }, 5000);
    return () => clearInterval(timer);
  }, [pending, router]);

  async function pay(capture = false) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true); setError(null);
    try {
      const response = await fetch(`/api/paypal/${capture ? "capture" : "checkout"}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ service, locale, ...(capture ? {} : { amount }) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || (en ? "Please try again." : "Intentá nuevamente."));
      if (data.url) { window.location.assign(data.url); return; }
      setWaiting(true); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No pudimos conectar con PayPal."); }
    finally { lock.current = false; setBusy(false); }
  }

  const terminal = status === "refunded" || status === "reversed" || status === "failed";
  return <div className="space-y-5">
    {amount && <p className="text-xl font-semibold">{en ? "Total · One-time payment:" : "Total · Pago único:"} USD {amount}</p>}
    <p>{en ? "Payment is completed securely on PayPal. You can use a PayPal account different from the email you use to sign in to Universo Senda." : "El pago se completa de forma segura en PayPal. Podés usar una cuenta PayPal distinta del email con el que ingresaste a Universo Senda."}</p>
    <div role="status" aria-live="polite">
      {approved ? (en ? "Payment approved. Your service is ready to continue." : "Pago aprobado. Tu servicio está habilitado para continuar.") :
        terminal ? (en ? "Payment declined, refunded or reversed. Contact the team to continue." : "Pago rechazado, reembolsado o revertido. Contactá al equipo para continuar.") :
        busy ? (en ? "Starting payment…" : "Iniciando pago…") :
        cancelled ? (en ? "Checkout cancelled. You can resume your order; its payment status is verified separately." : "Salida de PayPal cancelada. Podés retomar tu orden; el estado del pago se verifica por separado.") :
        pending ? (en ? "Pending confirmation. You can return later from your account." : "Pendiente de confirmación. Podés volver desde tu cuenta más tarde.") : null}
    </div>
    {(error || unavailable) && <p role="alert">{error || unavailable}</p>}
    {!approved && !terminal && <button className="rounded-full bg-[var(--senda-action)] px-6 py-3 font-semibold text-white disabled:opacity-50" disabled={busy || !!unavailable || !amount} onClick={() => pay()}>{en ? "Pay with PayPal" : "Pagar con PayPal"}</button>}
    {returned && !approved && !terminal && <button disabled={busy || !!unavailable} className="ml-3 underline" onClick={() => pay(true)}>{en ? "Retry confirmation" : "Reintentar confirmación"}</button>}
    {pending && <button className="ml-3 underline" onClick={() => router.refresh()}>{en ? "Refresh status" : "Actualizar estado"}</button>}
  </div>;
}
