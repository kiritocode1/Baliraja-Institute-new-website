"use client";

import { useActionState } from "react";
import {
  type RequestOtpState,
  requestOtp,
  type VerifyOtpState,
  verifyOtpAction,
} from "@/app/crm/login/actions";

const initialRequestState: RequestOtpState = { status: "idle" };
const initialVerifyState: VerifyOtpState = { status: "idle" };

const fieldClass =
  "w-full border border-line-strong bg-parchment px-4 py-3 text-ink outline-none transition-colors placeholder:text-ink-soft/60 focus:border-brass-deep";

export function CrmLoginForm() {
  const [requestState, requestAction, requesting] = useActionState(
    requestOtp,
    initialRequestState,
  );
  const [verifyState, verifyAction, verifying] = useActionState(
    verifyOtpAction,
    initialVerifyState,
  );

  const email = requestState.email ?? "";
  const codeReady = requestState.status === "sent" && email;

  return (
    <div className="border border-line-strong bg-parchment p-6 shadow-sm sm:p-8">
      <form action={requestAction} className="flex flex-col gap-5">
        <div>
          <label
            htmlFor="crm-email"
            className="mb-2 block text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-ink"
          >
            Admin email
          </label>
          <input
            id="crm-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            defaultValue={email}
            placeholder="you@balirajaacademy.in"
            className={fieldClass}
          />
        </div>
        {requestState.message && (
          <p
            className={`text-sm leading-relaxed ${
              requestState.status === "error"
                ? "text-destructive"
                : "text-ink-soft"
            }`}
          >
            {requestState.message}
          </p>
        )}
        <button
          type="submit"
          disabled={requesting}
          className="inline-flex items-center justify-center bg-oxblood px-6 py-3 text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-oxblood-bright disabled:cursor-not-allowed disabled:opacity-70"
        >
          {requesting
            ? "Sending code..."
            : codeReady
              ? "Resend code"
              : "Send login code"}
        </button>
      </form>

      {codeReady && (
        <form action={verifyAction} className="mt-8 border-t border-line pt-7">
          <input type="hidden" name="email" value={email} />
          <label
            htmlFor="crm-otp"
            className="mb-2 block text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-ink"
          >
            6-digit code
          </label>
          <input
            id="crm-otp"
            name="otp"
            required
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            placeholder="000000"
            className={`${fieldClass} text-center font-mono text-2xl tracking-[0.35em]`}
          />
          {verifyState.message && (
            <p className="mt-3 text-sm leading-relaxed text-destructive">
              {verifyState.message}
            </p>
          )}
          <button
            type="submit"
            disabled={verifying}
            className="mt-5 inline-flex w-full items-center justify-center bg-brass-deep px-6 py-3 text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-oxblood disabled:cursor-not-allowed disabled:opacity-70"
          >
            {verifying ? "Checking..." : "Open CRM"}
          </button>
        </form>
      )}
    </div>
  );
}
