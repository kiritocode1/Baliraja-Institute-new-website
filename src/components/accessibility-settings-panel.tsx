"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Accessibility,
  ALargeSmall,
  AlignJustify,
  Baseline,
  Contrast,
  Eye,
  ImageOff,
  Link as LinkIcon,
  MousePointer2,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useScreenReader } from "@/hooks/use-screen-reader";
import { cn } from "@/lib/utils";

type TextScale = "normal" | "large" | "larger";

type AccessibilitySettings = {
  textScale: TextScale;
  textSpacing: boolean;
  lineHeight: boolean;
  readableFont: boolean;
  highContrast: boolean;
  mutedColors: boolean;
  invertColors: boolean;
  highlightLinks: boolean;
  largeCursor: boolean;
  pauseMotion: boolean;
  hideMedia: boolean;
  hoverReader: boolean;
};

const storageKey = "baliraja-accessibility-settings";

const defaultSettings: AccessibilitySettings = {
  textScale: "normal",
  textSpacing: false,
  lineHeight: false,
  readableFont: false,
  highContrast: false,
  mutedColors: false,
  invertColors: false,
  highlightLinks: false,
  largeCursor: false,
  pauseMotion: false,
  hideMedia: false,
  hoverReader: false,
};

const textScaleLabels: Record<TextScale, string> = {
  normal: "100%",
  large: "112%",
  larger: "125%",
};

const textScaleOrder: TextScale[] = ["normal", "large", "larger"];

function readStoredSettings(): AccessibilitySettings {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return defaultSettings;

    return {
      ...defaultSettings,
      ...(JSON.parse(raw) as Partial<AccessibilitySettings>),
    };
  } catch {
    return defaultSettings;
  }
}

function applySettings(settings: AccessibilitySettings) {
  const root = document.documentElement;

  root.dataset.a11yTextScale = settings.textScale;
  root.toggleAttribute("data-a11y-text-spacing", settings.textSpacing);
  root.toggleAttribute("data-a11y-line-height", settings.lineHeight);
  root.toggleAttribute("data-a11y-readable-font", settings.readableFont);
  root.toggleAttribute("data-a11y-high-contrast", settings.highContrast);
  root.toggleAttribute("data-a11y-muted-colors", settings.mutedColors);
  root.toggleAttribute("data-a11y-invert", settings.invertColors);
  root.toggleAttribute("data-a11y-highlight-links", settings.highlightLinks);
  root.toggleAttribute("data-a11y-large-cursor", settings.largeCursor);
  root.toggleAttribute("data-a11y-pause-motion", settings.pauseMotion);
  root.toggleAttribute("data-a11y-hide-media", settings.hideMedia);
}

function clearSettingsAttributes() {
  const root = document.documentElement;

  root.removeAttribute("data-a11y-text-scale");
  root.removeAttribute("data-a11y-text-spacing");
  root.removeAttribute("data-a11y-line-height");
  root.removeAttribute("data-a11y-readable-font");
  root.removeAttribute("data-a11y-high-contrast");
  root.removeAttribute("data-a11y-muted-colors");
  root.removeAttribute("data-a11y-invert");
  root.removeAttribute("data-a11y-highlight-links");
  root.removeAttribute("data-a11y-large-cursor");
  root.removeAttribute("data-a11y-pause-motion");
  root.removeAttribute("data-a11y-hide-media");
}

function collectPageText() {
  const source = document.querySelector("main") ?? document.body;
  const clone = source.cloneNode(true) as HTMLElement;

  clone
    .querySelectorAll(
      "[data-accessibility-panel], script, style, noscript, svg, video",
    )
    .forEach((element) => {
      element.remove();
    });

  return clone.textContent?.replace(/\s+/g, " ").trim().slice(0, 2400) ?? "";
}

type ToggleItem = {
  key: keyof AccessibilitySettings;
  label: string;
  icon: typeof AlignJustify;
};

const toggles: ToggleItem[] = [
  { key: "readableFont", label: "Readable font", icon: ALargeSmall },
  { key: "textSpacing", label: "Text spacing", icon: AlignJustify },
  { key: "lineHeight", label: "Line height", icon: Baseline },
  { key: "highContrast", label: "High contrast", icon: Contrast },
  { key: "mutedColors", label: "Muted color", icon: Eye },
  { key: "invertColors", label: "Invert color", icon: Contrast },
  { key: "highlightLinks", label: "Highlight links", icon: LinkIcon },
  { key: "largeCursor", label: "Large cursor", icon: MousePointer2 },
  { key: "pauseMotion", label: "Pause motion", icon: Pause },
  { key: "hideMedia", label: "Hide media", icon: ImageOff },
  { key: "hoverReader", label: "Hover reader", icon: Volume2 },
];

export function AccessibilitySettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] =
    useState<AccessibilitySettings>(defaultSettings);
  const [settingsReady, setSettingsReady] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  useScreenReader(settings.hoverReader && speechSupported);

  useEffect(() => {
    setSettings(readStoredSettings());
    setSpeechSupported("speechSynthesis" in window);
    setSettingsReady(true);
  }, []);

  useEffect(() => {
    if (!settingsReady) return;

    applySettings(settings);
    window.localStorage.setItem(storageKey, JSON.stringify(settings));

    return () => {
      clearSettingsAttributes();
    };
  }, [settings, settingsReady]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.key.toLowerCase() === "a") {
        event.preventDefault();
        setIsOpen((current) => !current);
      }

      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const activeCount = useMemo(
    () =>
      Object.entries(settings).filter(([key, value]) =>
        key === "textScale" ? value !== "normal" : Boolean(value),
      ).length,
    [settings],
  );

  const setTextScale = (direction: 1 | -1) => {
    setSettings((current) => {
      const index = textScaleOrder.indexOf(current.textScale);
      const nextIndex = Math.min(
        textScaleOrder.length - 1,
        Math.max(0, index + direction),
      );

      return { ...current, textScale: textScaleOrder[nextIndex] };
    });
  };

  const toggleSetting = (key: keyof AccessibilitySettings) => {
    if (key === "textScale") return;

    setSettings((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const togglePageSpeech = () => {
    if (!speechSupported) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const text = collectPageText();
    if (!text) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.86;
    utterance.pitch = 1;
    utterance.volume = 0.82;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const resetSettings = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setSettings(defaultSettings);
    window.localStorage.removeItem(storageKey);
  };

  return (
    <div
      className="fixed bottom-5 right-5 z-[90] sm:bottom-7 sm:right-7"
      data-accessibility-panel
    >
      <button
        type="button"
        aria-label="Open accessibility settings"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
        className="group flex h-14 min-w-14 items-center justify-center gap-3 overflow-hidden border border-brass/70 bg-oxblood px-4 text-cream shadow-[0_18px_45px_rgba(50,18,12,0.28)] transition-[background-color,min-width] duration-300 hover:min-w-52 hover:bg-oxblood-bright focus-visible:min-w-52 sm:h-16 sm:min-w-16"
      >
        <Accessibility className="size-6 shrink-0" aria-hidden="true" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap text-[0.76rem] font-semibold uppercase tracking-[0.14em] opacity-0 transition-all duration-300 group-hover:max-w-40 group-hover:opacity-100 group-focus-visible:max-w-40 group-focus-visible:opacity-100">
          Accessibility
        </span>
        {activeCount > 0 ? (
          <span className="absolute -right-1 -top-1 grid size-6 place-items-center bg-brass text-[0.68rem] font-bold text-oxblood-deep">
            {activeCount}
          </span>
        ) : null}
      </button>

      <AnimatePresence>
        {isOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Close accessibility settings"
              className="fixed inset-0 z-[91] bg-oxblood-deep/45 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-labelledby="accessibility-panel-title"
              className="fixed inset-y-0 right-0 z-[92] flex w-full max-w-[25rem] flex-col overflow-y-auto border-l border-brass/40 bg-parchment text-ink shadow-[-22px_0_55px_rgba(42,18,13,0.22)]"
              initial={{ x: "100%", opacity: 0.8 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.8 }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              data-accessibility-panel
            >
              <div className="sticky top-0 z-10 border-b border-line bg-parchment/95 px-5 py-5 backdrop-blur">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-brass-deep">
                      Baliraja
                    </p>
                    <h2
                      id="accessibility-panel-title"
                      className="mt-2 font-display text-3xl leading-none tracking-normal text-oxblood"
                    >
                      Accessibility
                    </h2>
                  </div>
                  <button
                    type="button"
                    aria-label="Close accessibility settings"
                    onClick={() => setIsOpen(false)}
                    className="grid size-10 place-items-center border border-line-strong text-oxblood transition-colors hover:border-oxblood hover:bg-parchment-deep"
                  >
                    <X className="size-5" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-7 px-5 py-6">
                <section aria-labelledby="text-size-title">
                  <div className="flex items-center justify-between gap-3">
                    <h3
                      id="text-size-title"
                      className="font-display text-xl tracking-normal text-oxblood"
                    >
                      Text size
                    </h3>
                    <span className="border border-line bg-paper px-3 py-1 text-sm font-semibold text-ink">
                      {textScaleLabels[settings.textScale]}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-[3rem_1fr_3rem] items-center border border-line-strong">
                    <button
                      type="button"
                      aria-label="Decrease text size"
                      onClick={() => setTextScale(-1)}
                      className="grid size-12 place-items-center border-r border-line-strong text-oxblood transition-colors hover:bg-parchment-deep disabled:opacity-40"
                      disabled={settings.textScale === "normal"}
                    >
                      <span aria-hidden="true">-</span>
                    </button>
                    <div className="px-4 text-center text-[0.82rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                      {settings.textScale === "normal"
                        ? "Default"
                        : settings.textScale === "large"
                          ? "Large"
                          : "Largest"}
                    </div>
                    <button
                      type="button"
                      aria-label="Increase text size"
                      onClick={() => setTextScale(1)}
                      className="grid size-12 place-items-center border-l border-line-strong text-oxblood transition-colors hover:bg-parchment-deep disabled:opacity-40"
                      disabled={settings.textScale === "larger"}
                    >
                      <span aria-hidden="true">+</span>
                    </button>
                  </div>
                </section>

                <section
                  aria-labelledby="page-adjustments-title"
                  className="border-t border-line pt-6"
                >
                  <h3
                    id="page-adjustments-title"
                    className="font-display text-xl tracking-normal text-oxblood"
                  >
                    Page adjustments
                  </h3>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {toggles.map((item) => {
                      const Icon = item.icon;
                      const active = Boolean(settings[item.key]);
                      const disabled =
                        item.key === "hoverReader" && !speechSupported;

                      return (
                        <button
                          key={item.key}
                          type="button"
                          role="switch"
                          aria-checked={active}
                          disabled={disabled}
                          onClick={() => toggleSetting(item.key)}
                          className={cn(
                            "flex min-h-[5.2rem] min-w-0 flex-col items-start justify-between gap-3 border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-45",
                            active
                              ? "border-oxblood bg-oxblood text-cream"
                              : "border-line-strong bg-paper text-ink hover:border-oxblood/55 hover:bg-parchment-deep",
                          )}
                        >
                          <Icon
                            className={cn(
                              "size-5 shrink-0",
                              active ? "text-brass-bright" : "text-oxblood",
                            )}
                            aria-hidden="true"
                          />
                          <span className="max-w-full text-[0.78rem] font-semibold uppercase leading-snug tracking-[0.1em]">
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section
                  aria-labelledby="speech-tools-title"
                  className="border-t border-line pt-6"
                >
                  <h3
                    id="speech-tools-title"
                    className="font-display text-xl tracking-normal text-oxblood"
                  >
                    Speech
                  </h3>
                  <button
                    type="button"
                    onClick={togglePageSpeech}
                    disabled={!speechSupported}
                    className="mt-4 flex w-full items-center justify-between gap-4 border border-line-strong bg-paper px-4 py-4 text-left text-ink transition-colors hover:border-oxblood/55 hover:bg-parchment-deep disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <span className="flex items-center gap-3 text-[0.82rem] font-semibold uppercase tracking-[0.12em]">
                      {isSpeaking ? (
                        <VolumeX
                          className="size-5 text-oxblood"
                          aria-hidden="true"
                        />
                      ) : (
                        <Volume2
                          className="size-5 text-oxblood"
                          aria-hidden="true"
                        />
                      )}
                      {isSpeaking ? "Stop speech" : "Read page"}
                    </span>
                    <span className="text-sm text-ink-soft">
                      {speechSupported ? "Web speech" : "Unavailable"}
                    </span>
                  </button>
                </section>
              </div>

              <div className="border-t border-line px-5 py-5">
                <button
                  type="button"
                  onClick={resetSettings}
                  className="inline-flex w-full items-center justify-center gap-3 border border-oxblood px-4 py-3 text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-oxblood transition-colors hover:bg-oxblood hover:text-cream"
                >
                  <RotateCcw className="size-4" aria-hidden="true" />
                  Reset settings
                </button>
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
