"use client";

import { useActionState, useId } from "react";
import { type EnquiryState, submitEnquiry } from "@/app/admissions/actions";
import { examTracks, featuredExams } from "@/lib/site";

const initialEnquiryState: EnquiryState = { status: "idle" };

const fieldBase =
  "w-full border bg-parchment px-4 py-3.5 text-ink placeholder:text-ink-soft/60 transition-colors focus-visible:outline-none focus-visible:border-brass-deep";

const trackOptions = [
  ...featuredExams.map((track) => track.title),
  ...examTracks.map((track) => track.title),
];

function ErrorText({ id, children }: { id: string; children?: string }) {
  if (!children) return null;
  return (
    <p id={id} className="mt-1.5 text-[0.82rem] text-destructive">
      {children}
    </p>
  );
}

export function EnquiryForm({ defaultTrack = "" }: { defaultTrack?: string }) {
  const [state, formAction, isPending] = useActionState<EnquiryState, FormData>(
    submitEnquiry,
    initialEnquiryState,
  );
  const uid = useId();
  const errors = state.status === "error" ? state.errors : undefined;

  if (state.status === "success") {
    return (
      <div className="border border-line-strong bg-parchment-deep p-8 sm:p-10">
        <p className="font-display text-2xl leading-snug text-oxblood">
          Enquiry received.
        </p>
        <p className="mt-3 max-w-prose text-pretty leading-relaxed text-ink-soft">
          {state.message}
        </p>
        <a
          href="/admissions"
          className="mt-6 inline-flex text-[0.8rem] font-semibold uppercase tracking-[0.16em] text-oxblood link-hover link-hover--slide"
        >
          Send another enquiry
        </a>
      </div>
    );
  }

  const id = (name: string) => `${uid}-${name}`;

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      {/* Honeypot */}
      <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden">
        <label htmlFor={id("company")}>Company</label>
        <input
          id={id("company")}
          name="company"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor={id("name")}
            className="mb-2 block text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-ink"
          >
            Full name <span className="text-destructive">*</span>
          </label>
          <input
            id={id("name")}
            name="name"
            type="text"
            required
            autoComplete="name"
            placeholder="Your name"
            aria-invalid={Boolean(errors?.name)}
            aria-describedby={errors?.name ? id("name-err") : undefined}
            className={`${fieldBase} ${errors?.name ? "border-destructive" : "border-line-strong"}`}
          />
          <ErrorText id={id("name-err")}>{errors?.name}</ErrorText>
        </div>

        <div>
          <label
            htmlFor={id("phone")}
            className="mb-2 block text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-ink"
          >
            Phone <span className="text-destructive">*</span>
          </label>
          <input
            id={id("phone")}
            name="phone"
            type="tel"
            inputMode="tel"
            required
            autoComplete="tel"
            placeholder="10-digit mobile number"
            aria-invalid={Boolean(errors?.phone)}
            aria-describedby={errors?.phone ? id("phone-err") : undefined}
            className={`${fieldBase} ${errors?.phone ? "border-destructive" : "border-line-strong"}`}
          />
          <ErrorText id={id("phone-err")}>{errors?.phone}</ErrorText>
        </div>

        <div>
          <label
            htmlFor={id("email")}
            className="mb-2 block text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-ink"
          >
            Email <span className="text-ink-soft">(optional)</span>
          </label>
          <input
            id={id("email")}
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={Boolean(errors?.email)}
            aria-describedby={errors?.email ? id("email-err") : undefined}
            className={`${fieldBase} ${errors?.email ? "border-destructive" : "border-line-strong"}`}
          />
          <ErrorText id={id("email-err")}>{errors?.email}</ErrorText>
        </div>

        <div>
          <label
            htmlFor={id("track")}
            className="mb-2 block text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-ink"
          >
            Exam track <span className="text-destructive">*</span>
          </label>
          <select
            id={id("track")}
            name="track"
            required
            defaultValue={defaultTrack}
            aria-invalid={Boolean(errors?.track)}
            aria-describedby={errors?.track ? id("track-err") : undefined}
            className={`${fieldBase} appearance-none ${errors?.track ? "border-destructive" : "border-line-strong"}`}
          >
            <option value="" disabled>
              Select an exam
            </option>
            {trackOptions.map((track) => (
              <option key={track} value={track}>
                {track}
              </option>
            ))}
            <option value="Not sure yet">Not sure yet</option>
          </select>
          <ErrorText id={id("track-err")}>{errors?.track}</ErrorText>
        </div>
      </div>

      <div>
        <label
          htmlFor={id("message")}
          className="mb-2 block text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-ink"
        >
          Anything we should know?{" "}
          <span className="text-ink-soft">(optional)</span>
        </label>
        <textarea
          id={id("message")}
          name="message"
          rows={4}
          placeholder="Your current attempt, medium of preparation, or questions."
          className={`${fieldBase} resize-none border-line-strong`}
        />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center gap-3 bg-oxblood px-8 py-4 text-[0.8rem] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-oxblood-bright disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "Sending…" : "Submit enquiry"}
          {!isPending && <span aria-hidden="true">→</span>}
        </button>
        <p className="text-[0.82rem] leading-relaxed text-ink-soft">
          We call you back within two working days. No spam, ever.
        </p>
      </div>
    </form>
  );
}
