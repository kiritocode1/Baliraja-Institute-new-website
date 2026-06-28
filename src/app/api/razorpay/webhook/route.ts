import { NextResponse } from "next/server";
import {
  markInvoicePaidFromRazorpay,
  markInvoicePaymentFailedFromRazorpay,
  markInvoiceRefundedFromRazorpay,
  markRazorpayEventProcessed,
  storeRazorpayEvent,
} from "@/lib/crm/students";
import { verifyRazorpayWebhookSignature } from "@/lib/student/razorpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RazorpayPaymentEntity = {
  id?: unknown;
  order_id?: unknown;
  amount?: unknown;
  amount_refunded?: unknown;
  currency?: unknown;
  status?: unknown;
  method?: unknown;
};

type RazorpayWebhookPayload = {
  id?: unknown;
  event?: unknown;
  payload?: {
    payment?: {
      entity?: RazorpayPaymentEntity;
    };
  };
};

function getString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function getAmount(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";

  if (
    !signature ||
    !verifyRazorpayWebhookSignature({
      rawBody,
      signature,
    })
  ) {
    return NextResponse.json(
      { error: "Invalid Razorpay webhook signature." },
      { status: 400 },
    );
  }

  let payload: RazorpayWebhookPayload;

  try {
    payload = JSON.parse(rawBody) as RazorpayWebhookPayload;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const eventType = getString(payload.event) ?? "unknown";
  const eventId = getString(payload.id);
  const payment = payload.payload?.payment?.entity;
  const orderId = getString(payment?.order_id);
  const paymentId = getString(payment?.id);
  const storedEvent = await storeRazorpayEvent({
    eventId,
    eventType,
    orderId,
    paymentId,
    signature,
    rawPayload: rawBody,
  });

  if (!storedEvent.inserted && storedEvent.processedAt) {
    return NextResponse.json({ success: true, duplicate: true });
  }

  try {
    if (eventType === "payment.captured") {
      if (!payment || !orderId || !paymentId) {
        return NextResponse.json(
          { error: "Captured payment webhook is missing payment fields." },
          { status: 400 },
        );
      }

      const amountPaise = getAmount(payment.amount);
      const currency = getString(payment.currency);
      const status = getString(payment.status);

      if (amountPaise === null || !currency || status !== "captured") {
        return NextResponse.json(
          { error: "Captured payment payload is invalid." },
          { status: 400 },
        );
      }

      await markInvoicePaidFromRazorpay({
        orderId,
        paymentId,
        amountPaise,
        currency,
        method: getString(payment.method),
        rawPayload: payload,
      });
    } else if (eventType === "payment.failed") {
      if (!payment || !orderId || !paymentId) {
        return NextResponse.json(
          { error: "Failed payment webhook is missing payment fields." },
          { status: 400 },
        );
      }

      await markInvoicePaymentFailedFromRazorpay({
        orderId,
        paymentId,
        amountPaise: getAmount(payment.amount),
        currency: getString(payment.currency),
        method: getString(payment.method),
        rawPayload: payload,
      });
    } else if (eventType === "payment.refunded") {
      if (!payment || !orderId || !paymentId) {
        return NextResponse.json(
          { error: "Refunded payment webhook is missing payment fields." },
          { status: 400 },
        );
      }

      const amountRefundedPaise = getAmount(payment.amount_refunded);

      if (amountRefundedPaise === null) {
        return NextResponse.json(
          { error: "Refunded payment payload is missing amount_refunded." },
          { status: 400 },
        );
      }

      await markInvoiceRefundedFromRazorpay({
        orderId,
        paymentId,
        amountRefundedPaise,
        currency: getString(payment.currency),
        method: getString(payment.method),
        rawPayload: payload,
      });
    }
  } catch (error) {
    console.error("[razorpay/webhook] Processing failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Razorpay webhook processing failed.",
      },
      { status: 500 },
    );
  }

  await markRazorpayEventProcessed(storedEvent.id);

  return NextResponse.json({ success: true });
}
