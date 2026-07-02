"use client";

import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { useActionState, useEffect, useId, useMemo, useState } from "react";
import { type EnquiryState, submitEnquiry } from "@/app/admissions/actions";
import {
  admissionProgramLabels,
  programValues,
  referralSourceLabels,
  referralValues,
} from "@/schemas/admission.schema";

const initialEnquiryState: EnquiryState = { status: "idle" };
const lastStep = 3;

const fieldBase =
  "w-full border bg-parchment px-4 py-3.5 text-ink placeholder:text-ink-soft/60 transition-colors focus-visible:outline-none focus-visible:border-brass-deep";
const labelClass =
  "mb-2 block text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-ink";
const choiceClass =
  "group flex min-h-14 cursor-pointer items-center gap-3 border border-line-strong bg-parchment px-4 py-3 text-sm font-medium text-ink transition-colors hover:border-oxblood";

const steps = [
  {
    title: "Student details",
    description: "Identity, family contact, birth date and address.",
    fields: [
      "fullName",
      "gender",
      "guardianName",
      "dateOfBirth",
      "fullAddress",
    ],
  },
  {
    title: "Education",
    description: "Mobile numbers and the highest completed qualification.",
    fields: [
      "mobile1",
      "mobile2",
      "education",
      "education.tenth.percentage",
      "education.twelfth.stream",
      "education.twelfth.percentage",
      "education.graduation.course",
      "education.graduation.percentage",
    ],
  },
  {
    title: "Program",
    description: "Exam route and basic physical measurements.",
    fields: ["desiredPrograms", "weightKg", "heightCm"],
  },
  {
    title: "Referral",
    description: "How you found us and the final declaration.",
    fields: ["referralSources", "otherReferralDetail", "declarationAgreed"],
  },
];

function ErrorText({ id, children }: { id: string; children?: string }) {
  if (!children) return null;
  return (
    <p id={id} className="mt-1.5 text-[0.82rem] text-destructive">
      {children}
    </p>
  );
}

function errorFor(errors: Record<string, string> | undefined, name: string) {
  if (!errors) return undefined;
  return errors[name];
}

function fieldHasError(
  errors: Record<string, string> | undefined,
  name: string,
) {
  return Boolean(errorFor(errors, name));
}

function stepForErrors(errors: Record<string, string> | undefined) {
  if (!errors) return 0;
  const keys = Object.keys(errors);
  const step = steps.findIndex((item) =>
    item.fields.some((field) =>
      keys.some((key) => key === field || key.startsWith(`${field}.`)),
    ),
  );

  return step >= 0 ? step : 0;
}

function defaultProgramFromTrack(track: string) {
  const normalized = track.toLowerCase();

  if (normalized.includes("police")) return "police";
  if (normalized.includes("army") || normalized.includes("agniveer")) {
    return "army";
  }
  if (normalized.includes("air")) return "airforce";
  if (normalized.includes("navy")) return "navy";
  if (normalized.includes("rail") || normalized.includes("ssc")) {
    return "railway";
  }
  if (normalized.includes("staff")) return "staff";

  return null;
}

function FieldBlock({
  children,
  className = "",
  error,
  id,
  label,
  required = false,
}: {
  children: ReactNode;
  className?: string;
  error?: string;
  id: string;
  label: string;
  required?: boolean;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className={labelClass}>
        {label} {required ? <span className="text-destructive">*</span> : null}
      </label>
      {children}
      <ErrorText id={`${id}-err`}>{error}</ErrorText>
    </div>
  );
}

function Choice({
  checked = false,
  label,
  name,
  type = "checkbox",
  value,
}: {
  checked?: boolean;
  label: string;
  name: string;
  type?: "checkbox" | "radio";
  value: string;
}) {
  return (
    <label className={choiceClass}>
      <input
        className="peer sr-only"
        defaultChecked={checked}
        name={name}
        type={type}
        value={value}
      />
      <span
        aria-hidden="true"
        className="inline-flex size-5 shrink-0 items-center justify-center border border-line-strong text-transparent transition-colors peer-checked:border-oxblood peer-checked:bg-oxblood peer-checked:text-cream"
      >
        <Check className="size-3.5" />
      </span>
      <span>{label}</span>
    </label>
  );
}

export function EnquiryForm({
  defaultTrack = "",
  defaultRequestType = "admission",
}: {
  defaultTrack?: string;
  defaultRequestType?: string;
}) {
  const [state, formAction, isPending] = useActionState<EnquiryState, FormData>(
    submitEnquiry,
    initialEnquiryState,
  );
  const [currentStep, setCurrentStep] = useState(0);
  const uid = useId();
  const errors = state.status === "error" ? state.errors : undefined;
  const defaultProgram = useMemo(
    () => defaultProgramFromTrack(defaultTrack),
    [defaultTrack],
  );

  useEffect(() => {
    if (errors) setCurrentStep(stepForErrors(errors));
  }, [errors]);

  if (state.status === "success") {
    return (
      <div className="border border-line-strong bg-parchment-deep p-8 sm:p-10">
        <p className="font-display text-2xl leading-snug text-oxblood">
          Admission form received.
        </p>
        <p className="mt-3 max-w-prose text-pretty leading-relaxed text-ink-soft">
          {state.message}
        </p>
        <a
          href="/admissions"
          className="mt-6 inline-flex text-[0.8rem] font-semibold uppercase tracking-[0.16em] text-oxblood link-hover link-hover--slide"
        >
          Send another form
        </a>
      </div>
    );
  }

  const id = (name: string) => `${uid}-${name}`;

  return (
    <form
      action={formAction}
      className="border border-line-strong bg-paper"
      noValidate
    >
      <input type="hidden" name="requestType" value={defaultRequestType} />

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

      <div className="border-b border-line bg-parchment-deep p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-brass-deep">
              Step {currentStep + 1} of {steps.length}
            </p>
            <h2 className="mt-2 font-display text-3xl leading-none text-oxblood">
              {steps[currentStep].title}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
              {steps[currentStep].description}
            </p>
          </div>
          <div className="grid grid-cols-4 gap-1.5 lg:w-56">
            {steps.map((step, index) => (
              <button
                key={step.title}
                type="button"
                onClick={() => setCurrentStep(index)}
                aria-label={step.title}
                className={`h-2 transition-colors ${
                  currentStep === index ? "bg-oxblood" : "bg-line-strong"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden p-5 sm:p-7">
        <section
          className={currentStep === 0 ? "grid gap-6 sm:grid-cols-2" : "hidden"}
        >
          <FieldBlock
            id={id("fullName")}
            label="Full name"
            required
            error={errorFor(errors, "fullName")}
            className="sm:col-span-2"
          >
            <input
              id={id("fullName")}
              name="fullName"
              type="text"
              autoComplete="name"
              placeholder="Student full name"
              aria-invalid={fieldHasError(errors, "fullName")}
              aria-describedby={
                fieldHasError(errors, "fullName")
                  ? `${id("fullName")}-err`
                  : undefined
              }
              className={`${fieldBase} ${
                fieldHasError(errors, "fullName")
                  ? "border-destructive"
                  : "border-line-strong"
              }`}
            />
          </FieldBlock>

          <div>
            <p className={labelClass}>
              Gender <span className="text-destructive">*</span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Choice name="gender" value="male" label="Male" type="radio" />
              <Choice
                name="gender"
                value="female"
                label="Female"
                type="radio"
              />
            </div>
            <ErrorText id={id("gender-err")}>
              {errorFor(errors, "gender")}
            </ErrorText>
          </div>

          <FieldBlock
            id={id("guardianName")}
            label="Guardian / parent name"
            required
            error={errorFor(errors, "guardianName")}
          >
            <input
              id={id("guardianName")}
              name="guardianName"
              type="text"
              placeholder="Parent or guardian name"
              className={`${fieldBase} ${
                fieldHasError(errors, "guardianName")
                  ? "border-destructive"
                  : "border-line-strong"
              }`}
            />
          </FieldBlock>

          <FieldBlock
            id={id("dateOfBirth")}
            label="Date of birth"
            required
            error={errorFor(errors, "dateOfBirth")}
          >
            <input
              id={id("dateOfBirth")}
              name="dateOfBirth"
              type="text"
              inputMode="numeric"
              placeholder="DD/MM/YYYY"
              className={`${fieldBase} ${
                fieldHasError(errors, "dateOfBirth")
                  ? "border-destructive"
                  : "border-line-strong"
              }`}
            />
          </FieldBlock>

          <FieldBlock
            id={id("fullAddress")}
            label="Full address"
            required
            error={errorFor(errors, "fullAddress")}
            className="sm:col-span-2"
          >
            <textarea
              id={id("fullAddress")}
              name="fullAddress"
              rows={4}
              placeholder="House, village/city, taluka, district"
              className={`${fieldBase} resize-none ${
                fieldHasError(errors, "fullAddress")
                  ? "border-destructive"
                  : "border-line-strong"
              }`}
            />
          </FieldBlock>
        </section>

        <section
          className={currentStep === 1 ? "grid gap-6 sm:grid-cols-2" : "hidden"}
        >
          <FieldBlock
            id={id("mobile1")}
            label="Primary mobile"
            required
            error={errorFor(errors, "mobile1")}
          >
            <input
              id={id("mobile1")}
              name="mobile1"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="10-digit mobile number"
              className={`${fieldBase} ${
                fieldHasError(errors, "mobile1")
                  ? "border-destructive"
                  : "border-line-strong"
              }`}
            />
          </FieldBlock>

          <FieldBlock
            id={id("mobile2")}
            label="Alternate mobile"
            error={errorFor(errors, "mobile2")}
          >
            <input
              id={id("mobile2")}
              name="mobile2"
              type="tel"
              inputMode="numeric"
              placeholder="Optional"
              className={`${fieldBase} ${
                fieldHasError(errors, "mobile2")
                  ? "border-destructive"
                  : "border-line-strong"
              }`}
            />
          </FieldBlock>

          <div className="sm:col-span-2">
            <p className={labelClass}>
              Education <span className="text-destructive">*</span>
            </p>
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="border border-line bg-parchment-deep p-4">
                <p className="text-sm font-semibold text-oxblood">10th</p>
                <input
                  name="education.tenth.percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="Percentage"
                  className={`mt-3 ${fieldBase} ${
                    fieldHasError(errors, "education.tenth.percentage")
                      ? "border-destructive"
                      : "border-line-strong"
                  }`}
                />
                <ErrorText id={id("tenth-err")}>
                  {errorFor(errors, "education.tenth.percentage")}
                </ErrorText>
              </div>

              <div className="border border-line bg-parchment-deep p-4">
                <p className="text-sm font-semibold text-oxblood">12th</p>
                <input
                  name="education.twelfth.stream"
                  type="text"
                  placeholder="Stream"
                  className={`mt-3 ${fieldBase} border-line-strong`}
                />
                <input
                  name="education.twelfth.percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="Percentage"
                  className={`mt-3 ${fieldBase} ${
                    fieldHasError(errors, "education.twelfth.percentage")
                      ? "border-destructive"
                      : "border-line-strong"
                  }`}
                />
                <ErrorText id={id("twelfth-err")}>
                  {errorFor(errors, "education.twelfth.percentage")}
                </ErrorText>
              </div>

              <div className="border border-line bg-parchment-deep p-4">
                <p className="text-sm font-semibold text-oxblood">Graduation</p>
                <input
                  name="education.graduation.course"
                  type="text"
                  placeholder="Course"
                  className={`mt-3 ${fieldBase} ${
                    fieldHasError(errors, "education.graduation.course")
                      ? "border-destructive"
                      : "border-line-strong"
                  }`}
                />
                <input
                  name="education.graduation.percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="Percentage"
                  className={`mt-3 ${fieldBase} ${
                    fieldHasError(errors, "education.graduation.percentage")
                      ? "border-destructive"
                      : "border-line-strong"
                  }`}
                />
                <ErrorText id={id("graduation-err")}>
                  {errorFor(errors, "education.graduation.course") ||
                    errorFor(errors, "education.graduation.percentage")}
                </ErrorText>
              </div>
            </div>
            <ErrorText id={id("education-err")}>
              {errorFor(errors, "education")}
            </ErrorText>
          </div>
        </section>

        <section
          className={currentStep === 2 ? "grid gap-6 sm:grid-cols-2" : "hidden"}
        >
          <div className="sm:col-span-2">
            <p className={labelClass}>
              Desired programs <span className="text-destructive">*</span>
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {programValues.map((program) => (
                <Choice
                  key={program}
                  checked={defaultProgram === program}
                  name="desiredPrograms"
                  value={program}
                  label={admissionProgramLabels[program]}
                />
              ))}
            </div>
            <ErrorText id={id("programs-err")}>
              {errorFor(errors, "desiredPrograms")}
            </ErrorText>
          </div>

          <FieldBlock
            id={id("weightKg")}
            label="Weight (kg)"
            required
            error={errorFor(errors, "weightKg")}
          >
            <input
              id={id("weightKg")}
              name="weightKg"
              type="number"
              min="1"
              max="200"
              step="0.1"
              placeholder="Example: 62"
              className={`${fieldBase} ${
                fieldHasError(errors, "weightKg")
                  ? "border-destructive"
                  : "border-line-strong"
              }`}
            />
          </FieldBlock>

          <FieldBlock
            id={id("heightCm")}
            label="Height (cm)"
            required
            error={errorFor(errors, "heightCm")}
          >
            <input
              id={id("heightCm")}
              name="heightCm"
              type="number"
              min="1"
              max="250"
              step="0.1"
              placeholder="Example: 172"
              className={`${fieldBase} ${
                fieldHasError(errors, "heightCm")
                  ? "border-destructive"
                  : "border-line-strong"
              }`}
            />
          </FieldBlock>
        </section>

        <section
          className={currentStep === 3 ? "grid gap-6 sm:grid-cols-2" : "hidden"}
        >
          <div className="sm:col-span-2">
            <p className={labelClass}>
              How did you hear about us?{" "}
              <span className="text-destructive">*</span>
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {referralValues.map((source) => (
                <Choice
                  key={source}
                  name="referralSources"
                  value={source}
                  label={referralSourceLabels[source]}
                />
              ))}
            </div>
            <ErrorText id={id("referrals-err")}>
              {errorFor(errors, "referralSources")}
            </ErrorText>
          </div>

          <FieldBlock
            id={id("otherReferralDetail")}
            label="Other referral detail"
            error={errorFor(errors, "otherReferralDetail")}
            className="sm:col-span-2"
          >
            <textarea
              id={id("otherReferralDetail")}
              name="otherReferralDetail"
              rows={3}
              placeholder="Name, place, post, or any detail we should know"
              className={`${fieldBase} resize-none border-line-strong`}
            />
          </FieldBlock>

          <div className="sm:col-span-2">
            <label className="flex cursor-pointer items-start gap-3 border border-line-strong bg-parchment-deep p-4 text-sm leading-relaxed text-ink">
              <input
                className="mt-1 size-4 accent-oxblood"
                name="declarationAgreed"
                type="checkbox"
                value="true"
              />
              <span>
                I confirm that the information given above is true and I agree
                to be contacted by Baliraja Institute for admission counselling.
              </span>
            </label>
            <ErrorText id={id("declaration-err")}>
              {errorFor(errors, "declarationAgreed")}
            </ErrorText>
          </div>
        </section>
      </div>

      <div className="flex flex-col gap-3 border-t border-line bg-parchment-deep p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <button
          type="button"
          onClick={() => setCurrentStep((step) => Math.max(0, step - 1))}
          disabled={currentStep === 0 || isPending}
          className="inline-flex items-center justify-center gap-2 border border-line-strong px-5 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-ink transition-colors hover:border-oxblood hover:text-oxblood disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Back
        </button>

        {currentStep === lastStep ? (
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 bg-oxblood px-6 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-oxblood-bright disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? "Submitting" : "Submit admission form"}
            {!isPending ? (
              <Check className="size-4" aria-hidden="true" />
            ) : null}
          </button>
        ) : (
          <button
            type="button"
            onClick={() =>
              setCurrentStep((step) => Math.min(lastStep, step + 1))
            }
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 bg-oxblood px-6 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-oxblood-bright disabled:cursor-not-allowed disabled:opacity-70"
          >
            Continue
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </form>
  );
}
