import { NextResponse } from "next/server";
import {
  markInvoicePaidFromRazorpay,
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

  if (!storedEvent.inserted) {
    return NextResponse.json({ success: true, duplicate: true });
  }

  if (eventType === "payment.captured" && payment && orderId && paymentId) {
    const amountPaise = getAmount(payment.amount);

    if (amountPaise === null) {
      return NextResponse.json(
        { error: "Missing captured payment amount." },
        { status: 400 },
      );
    }

    await markInvoicePaidFromRazorpay({
      orderId,
      paymentId,
      amountPaise,
      method: getString(payment.method),
      rawPayload: payload,
    });
  }

  await markRazorpayEventProcessed(storedEvent.id);

  return NextResponse.json({ success: true });
}
