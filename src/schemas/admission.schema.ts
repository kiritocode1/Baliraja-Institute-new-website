import { z } from "zod";

export const genderValues = ["male", "female"] as const;
export const programValues = [
  "police",
  "army",
  "staff",
  "airforce",
  "navy",
  "railway",
] as const;
export const referralValues = [
  "social_media",
  "friend",
  "poster",
  "other",
] as const;

const genderEnum = z.enum(genderValues);
const programEnum = z.enum(programValues);
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

export const admissionFormSchema = z.object({
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
    .refine((data) => data.tenth || data.twelfth || data.graduation, {
      message: "At least one educational qualification is required",
    }),

  desiredPrograms: z.array(programEnum).min(1, "Select at least one program"),

  weightKg: z.number().positive().max(200, "Weight seems too high"),
  heightCm: z.number().positive().max(250, "Height seems too high"),

  referralSources: z
    .array(referralEnum)
    .min(1, "Please select how you heard about us"),
  otherReferralDetail: z.string().optional(),

  declarationAgreed: z.literal(true, {
    error: "You must agree to the declaration",
  }),
});

export type AdmissionFormInput = z.infer<typeof admissionFormSchema>;
