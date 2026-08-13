"use client";

import { ChevronDown } from "lucide-react";
import { useLocale } from "next-intl";
import Script from "next/script";
import { useEffect, useMemo, useState } from "react";
import { LOCALE_COOKIE } from "@/i18n/config";
import languages from "@/i18n/languages.json";
import { cn } from "@/lib/utils";

const maxAge = 60 * 60 * 24 * 365;
const fallbackLanguage = languages[0];
// en + mr are real next-intl locales; the rest fall back to Google Translate.
const nativeCodes = new Set(["en", "mr"]);
const translateCodes = languages
  .filter((language) => !nativeCodes.has(language.code))
  .map((language) => language.code)
  .join(",");

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate?: {
        TranslateElement: new (
          options: Record<string, unknown>,
          element: string,
        ) => unknown;
      };
    };
  }
}

function readCookie(name: string) {
  const value = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];

  return value ? decodeURIComponent(value) : "";
}

function writeLocaleCookie(code: string) {
  // biome-ignore lint/suspicious/noDocumentCookie: next-intl reads this locale cookie on the server.
  document.cookie = `${LOCALE_COOKIE}=${code}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

function writeGoogTrans(code: string) {
  // Google Translate always works off the English base DOM.
  const value = code === "en" ? "" : `/en/${code}`;
  const expiry = code === "en" ? "Max-Age=0" : `Max-Age=${maxAge}`;
  // biome-ignore lint/suspicious/noDocumentCookie: Google Translate reads this legacy cookie name.
  document.cookie = `googtrans=${value}; Path=/; ${expiry}; SameSite=Lax`;

  const host = window.location.hostname;
  const isIpAddress = /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
  if (host.includes(".") && !isIpAddress) {
    // biome-ignore lint/suspicious/noDocumentCookie: Google Translate needs the same cookie on the parent domain.
    document.cookie = `googtrans=${value}; Domain=.${host}; Path=/; ${expiry}; SameSite=Lax`;
  }
}

function activeGoogleCode() {
  if (typeof document === "undefined") return "";
  const match = readCookie("googtrans").match(/\/en\/([a-z-]+)/i);
  const code = match?.[1] ?? "";

  return languages.some((language) => language.code === code) ? code : "";
}

export function LanguageSwitcher({ light = false }: { light?: boolean }) {
  const locale = useLocale();
  const [selected, setSelected] = useState(locale);
  const activeLanguage = useMemo(
    () =>
      languages.find((language) => language.code === selected) ??
      fallbackLanguage,
    [selected],
  );

  useEffect(() => {
    // A live Google Translate selection wins over the next-intl locale.
    const google = activeGoogleCode();
    setSelected(google || locale);
  }, [locale]);

  function changeLanguage(code: string) {
    setSelected(code);

    if (nativeCodes.has(code)) {
      // Real EN/MR render: set the next-intl cookie, drop any Google overlay.
      writeLocaleCookie(code);
      writeGoogTrans("en");
      window.location.reload();
      return;
    }

    // Google Translate languages run off the English base DOM.
    writeLocaleCookie("en");
    writeGoogTrans(code);

    const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
    if (select) {
      select.value = code;
      select.dispatchEvent(new Event("change"));
      return;
    }

    window.location.reload();
  }

  return (
    <div className="notranslate relative" translate="no">
      <Script id="google-translate-init" strategy="afterInteractive">
        {`
          window.googleTranslateElementInit = function () {
            new window.google.translate.TranslateElement({
              pageLanguage: 'en',
              includedLanguages: '${translateCodes}',
              autoDisplay: false
            }, 'google_translate_element');
          };
        `}
      </Script>
      <Script
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />

      <div id="google_translate_element" aria-hidden="true" />

      <label className="sr-only" htmlFor="site-language">
        Language
      </label>
      <div
        className={cn(
          "relative inline-flex items-center rounded-full border px-3 py-2 text-[0.74rem] font-semibold uppercase tracking-[0.12em] transition-colors",
          light
            ? "border-cream/35 bg-oxblood-deep/20 text-cream"
            : "border-line-strong bg-parchment text-ink",
        )}
      >
        <span className="mr-2 hidden max-w-24 truncate sm:inline">
          {activeLanguage.nativeLabel}
        </span>
        <span className="mr-5 sm:hidden">{activeLanguage.code}</span>
        <select
          id="site-language"
          aria-label="Language"
          value={selected}
          onChange={(event) => changeLanguage(event.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0 bg-black text-white"
        >
          {languages.map((language) => (
            <option key={language.code} value={language.code} className="bg-black text-white">
              {language.nativeLabel}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none size-3.5" aria-hidden />
      </div>
    </div>
  );
}
