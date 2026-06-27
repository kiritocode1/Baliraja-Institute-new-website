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
  - callback verifies payment signature and marks payment as processing
  - Razorpay webhook is final source of truth for paid/captured status
  - raw webhook events are stored for idempotency and audit
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
  - callback signature verification works
  - webhook marks invoice paid exactly once
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
