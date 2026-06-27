import { NextResponse } from "next/server";
import {
  getStudentDashboard,
  getStudentInvoice,
  recordCheckoutVerifiedPayment,
} from "@/lib/crm/students";
import { getStudentSession } from "@/lib/student/auth";
import { verifyRazorpayPaymentSignature } from "@/lib/student/razorpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CheckoutPayload = {
  razorpay_payment_id?: unknown;
  razorpay_order_id?: unknown;
  razorpay_signature?: unknown;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getStudentSession();

  if (!session) {
    return NextResponse.json(
      { error: "Student login required." },
      { status: 401 },
    );
  }

  const [{ id }, dashboard] = await Promise.all([
    params,
    getStudentDashboard(session.studentId),
  ]);

  if (!dashboard) {
    return NextResponse.json(
      { error: "Student access is inactive." },
      { status: 403 },
    );
  }

  const invoice = await getStudentInvoice(session.studentId, id);

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
  }

  if (invoice.status === "paid") {
    return NextResponse.json({
      success: true,
      status: "paid",
      message: "This invoice is already marked paid.",
    });
  }

  let payload: CheckoutPayload;

  try {
    payload = (await request.json()) as CheckoutPayload;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const orderId = String(payload.razorpay_order_id ?? "");
  const paymentId = String(payload.razorpay_payment_id ?? "");
  const signature = String(payload.razorpay_signature ?? "");

  if (!orderId || !paymentId || !signature) {
    return NextResponse.json(
      { error: "Missing Razorpay payment fields." },
      { status: 400 },
    );
  }

  if (!invoice.razorpayOrderId || invoice.razorpayOrderId !== orderId) {
    return NextResponse.json(
      { error: "Payment order does not match this invoice." },
      { status: 400 },
    );
  }

  if (
    !verifyRazorpayPaymentSignature({
      orderId,
      paymentId,
      signature,
    })
  ) {
    return NextResponse.json(
      { error: "Payment signature verification failed." },
      { status: 400 },
    );
  }

  await recordCheckoutVerifiedPayment({
    invoiceId: invoice.id,
    studentId: dashboard.student.id,
    razorpayOrderId: orderId,
    razorpayPaymentId: paymentId,
    amountPaise: invoice.amountPaise,
    rawPayload: payload,
  });

  return NextResponse.json({
    success: true,
    status: "processing",
    message:
      "Payment received. Fees will show as paid after Razorpay sends the captured webhook.",
  });
}
