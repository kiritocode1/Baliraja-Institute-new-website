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

console.log(`Translation languages valid: ${translated.join(", ")}`);
