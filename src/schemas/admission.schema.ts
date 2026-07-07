import { z } from "zod";

export const genderValues = ["male", "female"] as const;
export const programValues = [
  "police",
  "army",
  "staff",
  "airforce",
  "navy",
  "railway",
  "school",
  "sports",
  "summer_camp",
] as const;
/** Programs where physical measurements and education records are mandatory. */
export const bhartiProgramValues = [
  "police",
  "army",
  "staff",
  "airforce",
  "navy",
  "railway",
] as const;
export const categoryValues = [
  "open",
  "obc",
  "sc",
  "st",
  "ews",
  "nt",
  "sbc",
  "other",
] as const;
export const referralValues = [
  "social_media",
  "friend",
  "poster",
  "other",
] as const;

const genderEnum = z.enum(genderValues);
const programEnum = z.enum(programValues);
const categoryEnum = z.enum(categoryValues);
const referralEnum = z.enum(referralValues);
const percentageSchema = z.coerce.number().min(0).max(100);

export const admissionProgramLabels: Record<
  (typeof programValues)[number],
  string
> = {
  police: "Police",
  army: "Army",
  staff: "Staff",
  airforce: "Air Force",
  navy: "Navy",
  railway: "Railway",
  school: "School",
  sports: "Sports Academy",
  summer_camp: "Summer Camp",
};

export const categoryLabels: Record<(typeof categoryValues)[number], string> = {
  open: "Open",
  obc: "OBC",
  sc: "SC",
  st: "ST",
  ews: "EWS",
  nt: "NT",
  sbc: "SBC",
  other: "Other",
};

export const referralSourceLabels: Record<
  (typeof referralValues)[number],
  string
> = {
  social_media: "Social media",
  friend: "Friend",
  poster: "Poster",
  other: "Other",
};

export function isBhartiProgram(program: string) {
  return (bhartiProgramValues as readonly string[]).includes(program);
}

export const admissionFormSchema = z
  .object({
    fullName: z.string().min(3, "Full name is required"),
    gender: genderEnum,
    guardianName: z.string().min(3, "Guardian/Parent name is required"),
    dateOfBirth: z
      .string()
      .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Use DD/MM/YYYY format"),
    fullAddress: z.string().min(10, "Please enter complete address"),

    mobile1: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number"),
    mobile2: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number")
      .optional(),
    email: z.string().email("Invalid email address").optional(),

    category: categoryEnum.optional(),
    maharashtraDomicile: z.boolean().optional(),

    education: z
      .object({
        tenth: z
          .object({
            percentage: percentageSchema,
          })
          .optional(),
        twelfth: z
          .object({
            stream: z.string().optional(),
            percentage: percentageSchema,
          })
          .optional(),
        graduation: z
          .object({
            course: z.string().min(2),
            percentage: percentageSchema.optional(),
          })
          .optional(),
      })
      .optional(),

    desiredPrograms: z.array(programEnum).min(1, "Select at least one program"),

    weightKg: z
      .number()
      .positive()
      .max(200, "Weight seems too high")
      .optional(),
    heightCm: z
      .number()
      .positive()
      .max(250, "Height seems too high")
      .optional(),
    chestCm: z
      .number()
      .positive()
      .max(200, "Chest measurement seems too high")
      .optional(),

    referralSources: z
      .array(referralEnum)
      .min(1, "Please select how you heard about us"),
    otherReferralDetail: z.string().optional(),

    declarationAgreed: z.literal(true, {
      error: "You must agree to the declaration",
    }),
  })
  .superRefine((data, ctx) => {
    // Physical measurements and education decide bharti eligibility; a
    // school/sports/camp enquiry shouldn't be forced to provide them.
    if (!data.desiredPrograms.some(isBhartiProgram)) return;

    if (!data.weightKg) {
      ctx.addIssue({
        code: "custom",
        path: ["weightKg"],
        message: "Weight is required for bharti programs",
      });
    }
    if (!data.heightCm) {
      ctx.addIssue({
        code: "custom",
        path: ["heightCm"],
        message: "Height is required for bharti programs",
      });
    }
    if (
      !data.education ||
      !(
        data.education.tenth ||
        data.education.twelfth ||
        data.education.graduation
      )
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["education"],
        message: "At least one educational qualification is required",
      });
    }
  });

export type AdmissionFormInput = z.infer<typeof admissionFormSchema>;
