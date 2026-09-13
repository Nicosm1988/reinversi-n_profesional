import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { PaypalCheckout } from "@/components/payments/paypal-checkout";
const refresh = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));
const props = { service: "orientacion-vocacional", locale: "es", amount: "450.00", status: null, returned: false, cancelled: false, unavailable: null };
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
it("return parameters alone never display an approved payment", () => {
  render(React.createElement(PaypalCheckout, { ...props, returned: true }));
  expect(screen.getByText(/Pendiente de confirmación/)).toBeTruthy(); expect(screen.queryByText(/Pago aprobado/)).toBeNull();
});
it("blocks payment when configuration is absent and displays the reason", () => {
  render(React.createElement(PaypalCheckout, { ...props, unavailable: "Falta configurar PayPal." }));
  expect(screen.getByRole("button", { name: "Pagar con PayPal" })).toBeDisabled(); expect(screen.getByRole("alert")).toHaveTextContent("Falta configurar PayPal.");
});
it("shows cancellation without activating the service", () => {
  render(React.createElement(PaypalCheckout, { ...props, cancelled: true }));
  expect(screen.getByText(/Salida de PayPal cancelada/)).toBeTruthy(); expect(screen.queryByText(/Pago aprobado/)).toBeNull();
});
it("prevents double click and presents a recoverable checkout error", async () => {
  let settle: (response: Response) => void = () => {};
  const fetcher = vi.fn().mockImplementation(() => new Promise<Response>(resolve => { settle = resolve; })); vi.stubGlobal("fetch", fetcher);
  render(React.createElement(PaypalCheckout, props));
  const button = screen.getByRole("button", { name: "Pagar con PayPal" });
  fireEvent.click(button); fireEvent.click(button); expect(fetcher).toHaveBeenCalledTimes(1);
  settle(Response.json({ error: "Reintentá el pago." }, { status: 503 }));
  await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Reintentá el pago.")); expect(button).toBeEnabled();
});
