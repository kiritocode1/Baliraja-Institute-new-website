# Baliraja Student Portal + Fees Plan

## Summary

Build a student-facing section where students log in, see course-specific notices
and materials, and pay fee invoices through Razorpay. Keep student auth separate
from admin CRM auth, while letting admins manage students, enrollments, notices,
materials, and fee dues from the CRM.

## Key Changes

- Add student auth with Gmail OTP:
  - `/student/login`
  - `/student`
  - signed HTTP-only student session cookie
  - separate `STUDENT_SESSION_SECRET`
- Add student CRM records:
  - students with name, phone, email, guardian/contact info, and active status
  - enrollments linking students to CRM-managed course pages and batches
  - course notices/materials targeted by course, batch, or individual student
  - notice attachments stored in Vercel Blob
- Add fee management:
  - admins create fee invoices/installments for students
  - students see pending/paid fees in `/student/fees`
  - receipt pages at `/student/receipts/[id]`
- Add Razorpay payment flow:
  - server creates Razorpay Order in INR paise
  - client opens Razorpay Checkout
  - order creation does not mark an invoice as processing by itself
  - callback verifies payment signature, fetches the payment from Razorpay, and
    marks payment as processing only after order, amount, currency, and status
    checks pass
  - Razorpay webhook is final source of truth for paid/captured status
  - raw webhook events are stored for idempotency and audit
  - duplicate webhooks are ignored only after a previous copy was processed
  - failed payment webhooks move processing invoices back to pending
  - full refund webhooks can mark invoices as refunded
- Add CRM navigation:
  - student list/create/edit
  - convert lead to student
  - assign course/batch
  - create notices/materials
  - create fee invoices

## Interfaces And Env

New env vars:

```txt
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_WEBHOOK_SECRET=
STUDENT_SESSION_SECRET=
```

## Test Plan

- Student OTP:
  - inactive/unknown student cannot receive OTP
  - active student receives OTP through Gmail
  - expired/used/wrong OTP fails
- Notices:
  - student only sees notices for their enrollment/course/batch or direct
    assignment
  - archived/expired notices are hidden
- Fees:
  - student sees correct pending invoices
  - Razorpay test payment creates order and opens checkout
  - repeated clicks reuse the existing order while pending
  - students cannot start another checkout while an invoice is processing
  - callback signature verification works
  - callback rejects wrong order, wrong amount, wrong currency, or failed
    Razorpay payment states
  - webhook marks invoice paid exactly once
  - duplicate unprocessed webhook retries still process
  - failed payment webhook returns invoice to pending
  - full refund webhook marks invoice refunded
  - receipt page only opens for the owning student
- Regression:
  - admin CRM login still works
  - existing blog/course CRM flows still build
  - `npm run lint` and `npm run build` pass

## Assumptions

- Phase one uses simple one-time fee invoices/installments, not subscriptions or
  autopay.
- Razorpay webhook is mandatory before a payment becomes final.
- Existing Neon DB and Vercel Blob remain the storage stack.
- Gmail OTP is reused for students, but tables/cookies/secrets remain separate
  from admins.
