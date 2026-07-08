// next-intl "without i18n routing" — locale lives in a cookie, URLs never change.
// `en` and `mr` are hand-authored via messages/*.json + *Mr content fields.
// The other languages in languages.json stay on Google Translate (English base).
export const locales = ["en", "mr"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const LOCALE_COOKIE = "NEXT_LOCALE";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}
