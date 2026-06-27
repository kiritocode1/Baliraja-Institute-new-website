import { NextResponse } from "next/server";
import {
  attachRazorpayOrder,
  getStudentDashboard,
  getStudentInvoice,
} from "@/lib/crm/students";
import { getStudentSession } from "@/lib/student/auth";
import {
  createRazorpayOrder,
  getRazorpayKeyId,
  hasRazorpayCheckoutConfig,
} from "@/lib/student/razorpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
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
    return NextResponse.json(
      { error: "This invoice is already paid." },
      { status: 409 },
    );
  }

  if (invoice.status === "cancelled" || invoice.status === "refunded") {
    return NextResponse.json(
      { error: "This invoice is not payable." },
      { status: 409 },
    );
  }

  if (!hasRazorpayCheckoutConfig()) {
    return NextResponse.json(
      { error: "Razorpay is not configured for this deployment." },
      { status: 503 },
    );
  }

  try {
    const order = await createRazorpayOrder({
      invoice,
      student: {
        id: dashboard.student.id,
        name: dashboard.student.name,
        email: dashboard.student.email,
        phone: dashboard.student.phone,
      },
    });
    await attachRazorpayOrder({
      invoiceId: invoice.id,
      studentId: dashboard.student.id,
      orderId: order.id,
    });

    return NextResponse.json({
      keyId: getRazorpayKeyId(),
      orderId: order.id,
      amount: order.amount,
      currency: "INR",
      name: "Baliraja Institute",
      description: invoice.title,
      student: {
        name: dashboard.student.name,
        email: dashboard.student.email,
        phone: dashboard.student.phone,
      },
    });
  } catch (error) {
    console.error("[student/fees/order] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create Razorpay order.",
      },
      { status: 500 },
    );
  }
}
