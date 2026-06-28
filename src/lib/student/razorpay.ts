import crypto from "node:crypto";
import type { FeeInvoice } from "@/lib/crm/students";

type RazorpayOrderResponse = {
  id: string;
  amount: number;
  amount_due: number;
  amount_paid: number;
  currency: string;
  receipt: string;
  status: string;
};

export type RazorpayPaymentResponse = {
  id: string;
  amount: number;
  currency: string;
  order_id: string;
  status: string;
  method: string | null;
};

export function getRazorpayKeyId() {
  return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
}

function getRazorpaySecret() {
  return process.env.RAZORPAY_KEY_SECRET;
}

export function hasRazorpayCheckoutConfig() {
  return Boolean(getRazorpayKeyId() && getRazorpaySecret());
}

export function verifyRazorpayPaymentSignature(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  const secret = getRazorpaySecret();

  if (!secret) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${input.orderId}|${input.paymentId}`)
    .digest("hex");

  return timingSafeEqual(expected, input.signature);
}

export function verifyRazorpayWebhookSignature(input: {
  rawBody: string;
  signature: string;
}) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(input.rawBody)
    .digest("hex");

  return timingSafeEqual(expected, input.signature);
}

function timingSafeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export async function createRazorpayOrder(input: {
  invoice: FeeInvoice;
  student: { id: string; name: string; email: string; phone: string };
}) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const secret = getRazorpaySecret();

  if (!keyId || !secret) {
    throw new Error("Razorpay key id and secret are not configured.");
  }

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${secret}`).toString(
        "base64",
      )}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: input.invoice.amountPaise,
      currency: "INR",
      payment_capture: true,
      receipt: input.invoice.receiptNumber,
      notes: {
        invoice_id: input.invoice.id,
        student_id: input.student.id,
        student_email: input.student.email,
      },
    }),
  });
  const payload = (await response.json().catch(() => ({}))) as
    | RazorpayOrderResponse
    | { error?: { description?: string } };

  if (!response.ok || !("id" in payload)) {
    const message =
      "error" in payload
        ? payload.error?.description
        : "Razorpay order creation failed.";
    throw new Error(message || "Razorpay order creation failed.");
  }

  return payload;
}

export async function fetchRazorpayPayment(paymentId: string) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const secret = getRazorpaySecret();

  if (!keyId || !secret) {
    throw new Error("Razorpay key id and secret are not configured.");
  }

  const response = await fetch(
    `https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${secret}`).toString(
          "base64",
        )}`,
      },
    },
  );
  const payload = (await response.json().catch(() => ({}))) as
    | RazorpayPaymentResponse
    | { error?: { description?: string } };

  if (!response.ok || !("id" in payload)) {
    const message =
      "error" in payload
        ? payload.error?.description
        : "Unable to fetch Razorpay payment.";
    throw new Error(message || "Unable to fetch Razorpay payment.");
  }

  return payload;
}
