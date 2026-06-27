"use client";

import Link from "next/link";
import { useState } from "react";
import type { FeeInvoice } from "@/lib/crm/students";

type RazorpayResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: "INR";
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: { color?: string };
  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
};

type RazorpayConstructor = new (
  options: RazorpayOptions,
) => {
  open: () => void;
};

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

type FeePaymentPanelProps = {
  invoices: FeeInvoice[];
  student: {
    name: string;
    email: string;
    phone: string;
  };
};

function formatDate(value: string | null) {
  if (!value) return "No date";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatPaise(amountPaise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amountPaise / 100);
}

function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve(true);

  return new Promise<boolean>((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    );

    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function FeePaymentPanel({ invoices, student }: FeePaymentPanelProps) {
  const [busyInvoiceId, setBusyInvoiceId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startPayment(invoice: FeeInvoice) {
    setBusyInvoiceId(invoice.id);
    setError(null);
    setMessage(null);

    try {
      const scriptReady = await loadRazorpayScript();

      if (!scriptReady || !window.Razorpay) {
        throw new Error("Razorpay Checkout could not be loaded.");
      }

      const orderResponse = await fetch(
        `/api/student/fees/${invoice.id}/order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
      );
      const orderPayload = (await orderResponse.json()) as
        | {
            keyId: string;
            orderId: string;
            amount: number;
            currency: "INR";
            name: string;
            description: string;
            student: { name: string; email: string; phone: string };
          }
        | { error?: string };

      if (!orderResponse.ok || !("orderId" in orderPayload)) {
        const orderError = "error" in orderPayload ? orderPayload.error : null;

        throw new Error(orderError || "Unable to create payment order.");
      }

      const checkout = new window.Razorpay({
        key: orderPayload.keyId,
        amount: orderPayload.amount,
        currency: orderPayload.currency,
        name: "Baliraja Institute",
        description: orderPayload.description,
        order_id: orderPayload.orderId,
        prefill: {
          name: orderPayload.student.name,
          email: orderPayload.student.email,
          contact: orderPayload.student.phone,
        },
        notes: {
          invoice_id: invoice.id,
        },
        theme: { color: "#711d1f" },
        handler: async (response) => {
          const verifyResponse = await fetch(
            `/api/student/fees/${invoice.id}/verify`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            },
          );
          const verifyPayload = (await verifyResponse.json()) as {
            error?: string;
            message?: string;
          };

          if (!verifyResponse.ok) {
            setError(
              verifyPayload.error ||
                "Payment could not be verified. Contact the office.",
            );
            setBusyInvoiceId(null);
            return;
          }

          setMessage(
            verifyPayload.message ||
              "Payment received. Waiting for Razorpay confirmation.",
          );
          setBusyInvoiceId(null);
        },
        modal: {
          ondismiss: () => setBusyInvoiceId(null),
        },
      });

      checkout.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed.");
      setBusyInvoiceId(null);
    }
  }

  const payableInvoices = invoices.filter(
    (invoice) =>
      invoice.status === "pending" || invoice.status === "processing",
  );
  const paidInvoices = invoices.filter((invoice) => invoice.status === "paid");

  return (
    <div className="space-y-8">
      {message ? (
        <p className="border border-brass bg-parchment px-4 py-3 text-sm leading-relaxed text-brass-deep">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="border border-destructive/40 bg-parchment px-4 py-3 text-sm leading-relaxed text-destructive">
          {error}
        </p>
      ) : null}

      <section className="bg-parchment px-5 py-7 sm:px-7">
        <div className="border-b border-line pb-5">
          <h2 className="font-display text-4xl text-oxblood">Pending fees</h2>
        </div>
        <div className="divide-y divide-line">
          {payableInvoices.map((invoice) => (
            <article
              key={invoice.id}
              className="grid gap-5 py-5 lg:grid-cols-[1fr_auto] lg:items-center"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-semibold text-ink">
                    {invoice.title}
                  </h3>
                  <span className="border border-line-strong px-2 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                    {invoice.status}
                  </span>
                </div>
                {invoice.description ? (
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {invoice.description}
                  </p>
                ) : null}
                <p className="mt-3 text-sm text-ink-soft">
                  Due {formatDate(invoice.dueDate)} · Receipt{" "}
                  {invoice.receiptNumber}
                </p>
              </div>
              <div className="flex flex-col items-start gap-3 lg:items-end">
                <p className="font-display text-3xl text-oxblood">
                  {formatPaise(invoice.amountPaise)}
                </p>
                <button
                  type="button"
                  disabled={busyInvoiceId === invoice.id}
                  onClick={() => startPayment(invoice)}
                  className="bg-oxblood px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-oxblood-bright disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {busyInvoiceId === invoice.id
                    ? "Opening..."
                    : invoice.status === "processing"
                      ? "Retry payment"
                      : "Pay now"}
                </button>
              </div>
            </article>
          ))}
          {payableInvoices.length === 0 ? (
            <p className="py-8 text-sm leading-relaxed text-ink-soft">
              No pending fee invoices for {student.name}.
            </p>
          ) : null}
        </div>
      </section>

      <section className="bg-parchment px-5 py-7 sm:px-7">
        <div className="border-b border-line pb-5">
          <h2 className="font-display text-4xl text-oxblood">Paid receipts</h2>
        </div>
        <div className="divide-y divide-line">
          {paidInvoices.map((invoice) => (
            <article
              key={invoice.id}
              className="grid gap-5 py-5 lg:grid-cols-[1fr_auto] lg:items-center"
            >
              <div>
                <h3 className="text-xl font-semibold text-ink">
                  {invoice.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  Paid {formatDate(invoice.paidAt)} · Receipt{" "}
                  {invoice.receiptNumber}
                </p>
              </div>
              <Link
                href={`/student/receipts/${invoice.id}`}
                className="w-fit border border-line-strong px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-ink transition-colors hover:border-oxblood hover:text-oxblood"
              >
                View receipt
              </Link>
            </article>
          ))}
          {paidInvoices.length === 0 ? (
            <p className="py-8 text-sm leading-relaxed text-ink-soft">
              Paid fee receipts will appear here after Razorpay confirms
              captured payment.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
