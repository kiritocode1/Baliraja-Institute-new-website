import fs from "node:fs";
import path from "node:path";

const required = ["mr", "hi", "bn", "te", "gu", "kn", "ml", "ta"];
const languagesPath = path.join(process.cwd(), "src", "i18n", "languages.json");
const languages = JSON.parse(fs.readFileSync(languagesPath, "utf8"));
const codes = languages.map((language) => language.code);
const translated = codes.filter((code) => code !== "en");

const missing = required.filter((code) => !translated.includes(code));
const extra = translated.filter((code) => !required.includes(code));
const duplicates = codes.filter((code, index) => codes.indexOf(code) !== index);

if (codes[0] !== "en") {
  throw new Error("English reset must be the first language.");
}

if (missing.length || extra.length || duplicates.length) {
  throw new Error(
    [
      missing.length ? `Missing: ${missing.join(", ")}` : "",
      extra.length ? `Unexpected: ${extra.join(", ")}` : "",
      duplicates.length ? `Duplicate: ${duplicates.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  );
}

for (const language of languages) {
  if (!language.label || !language.nativeLabel) {
    throw new Error(`Language ${language.code} needs label and nativeLabel.`);
  }
}

// next-intl throws at runtime on a missing message key, so en.json and mr.json
// must have identical key sets. Fail the build on any drift.
function keyPaths(obj, prefix = "") {
  const paths = [];
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      paths.push(...keyPaths(value, path));
    } else {
      paths.push(path);
    }
  }
  return paths.sort();
}

const messagesDir = path.join(process.cwd(), "messages");
const en = JSON.parse(fs.readFileSync(path.join(messagesDir, "en.json"), "utf8"));
const mr = JSON.parse(fs.readFileSync(path.join(messagesDir, "mr.json"), "utf8"));
const enKeys = keyPaths(en);
const mrKeys = keyPaths(mr);
const missingInMr = enKeys.filter((k) => !mrKeys.includes(k));
const missingInEn = mrKeys.filter((k) => !enKeys.includes(k));

if (missingInMr.length || missingInEn.length) {
  throw new Error(
    [
      "messages/en.json and messages/mr.json key sets differ:",
      missingInMr.length ? `Missing in mr.json: ${missingInMr.join(", ")}` : "",
      missingInEn.length ? `Missing in en.json: ${missingInEn.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  );
}

console.log(`Translation languages valid: ${translated.join(", ")}`);
console.log(`Message keys in sync: ${enKeys.length} keys (en == mr).`);
