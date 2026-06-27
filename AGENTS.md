<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Student Portal

For student portal, notices, and Razorpay fee work, start from
`docs/student-portal-plan.md`.

- Keep admin CRM auth and student auth separate.
- Do not mark fees paid from the browser callback alone; Razorpay webhook
  verification is required.
- Commit every logical step.
