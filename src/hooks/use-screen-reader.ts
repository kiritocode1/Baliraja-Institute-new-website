"use client";

import { useEffect, useRef } from "react";

function getReadableText(element: Element) {
  if (element instanceof HTMLImageElement) {
    return element.alt || element.getAttribute("aria-label") || "";
  }

  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement
  ) {
    return (
      element.getAttribute("aria-label") ||
      element.labels?.[0]?.textContent?.trim() ||
      element.placeholder ||
      ""
    );
  }

  if (element instanceof HTMLSelectElement) {
    return (
      element.getAttribute("aria-label") ||
      element.labels?.[0]?.textContent?.trim() ||
      element.selectedOptions[0]?.textContent?.trim() ||
      ""
    );
  }

  return (
    element.getAttribute("aria-label") ||
    element.getAttribute("title") ||
    element.textContent?.trim() ||
    ""
  );
}

function cleanSpeechText(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, 220);
}

export function useScreenReader(isEnabled: boolean) {
  const lastSpokenRef = useRef("");

  useEffect(() => {
    if (!isEnabled || !("speechSynthesis" in window)) {
      window.speechSynthesis?.cancel();
      return;
    }

    const speakElement = (event: MouseEvent | FocusEvent) => {
      const target = event.target;

      if (!(target instanceof Element)) return;
      if (target.closest("[data-accessibility-panel]")) return;

      const candidate =
        target.closest(
          "a, button, label, input, textarea, select, [aria-label], h1, h2, h3, p, li, figcaption, img",
        ) ?? target;
      const text = cleanSpeechText(getReadableText(candidate));

      if (!text || text === lastSpokenRef.current) return;

      lastSpokenRef.current = text;
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.82;
      utterance.pitch = 1;
      utterance.volume = 0.78;

      window.speechSynthesis.speak(utterance);
    };

    document.addEventListener("mouseover", speakElement);
    document.addEventListener("focusin", speakElement);

    return () => {
      document.removeEventListener("mouseover", speakElement);
      document.removeEventListener("focusin", speakElement);
      window.speechSynthesis.cancel();
      lastSpokenRef.current = "";
    };
  }, [isEnabled]);
}
