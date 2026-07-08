/**
 * Structured-content localization for the "titleMr" pattern.
 *
 * Any object key ending in `Mr` is treated as the Marathi variant of its base
 * key (e.g. `titleMr` -> `title`, `blurbMr` -> `blurb`). When `locale === "mr"`
 * and the Marathi value is a non-empty string, it overlays the base key.
 * Otherwise the English base is kept — so a blank Marathi value always falls
 * back cleanly. Recurses through arrays and nested objects (nav groups, links).
 *
 * Used for `src/lib/site.ts` content arrays and CRM-authored DB rows once their
 * `*_mr` columns are mapped to camelCase `*Mr` fields.
 */
export function localize<T>(value: T, locale: string): T {
  if (locale !== "mr") return value;
  if (Array.isArray(value)) {
    return value.map((item) => localize(item, locale)) as unknown as T;
  }
  if (value && typeof value === "object") {
    const src = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};

    for (const [key, val] of Object.entries(src)) {
      out[key] = localize(val, locale);
    }
    for (const key of Object.keys(src)) {
      if (!key.endsWith("Mr")) continue;
      const base = key.slice(0, -2);
      const mr = src[key];
      if (!(base in src)) continue;
      if (typeof mr === "string" && mr.trim() !== "") {
        out[base] = mr;
      } else if (Array.isArray(mr) && mr.length > 0) {
        out[base] = mr;
      }
    }

    return out as T;
  }
  return value;
}
