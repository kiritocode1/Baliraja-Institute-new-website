"use client";

import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { SvgUnderlineLink } from "@/components/links";
import {
  overlayPrimary,
  overlaySecondary,
  primaryNav,
  site,
  socials,
} from "@/lib/site";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(SplitText);
}

function Crest({ light }: { light: boolean }) {
  return (
    <Link
      href="/"
      aria-label={`${site.longName}, ${site.place} — home`}
      className="group flex items-center"
    >
      <BrandLogo
        className={cn(
          "w-[7.2rem] sm:w-[8.2rem]",
          light
            ? "drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]"
            : "mix-blend-difference",
        )}
      />
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const splitsRef = useRef<SplitText[]>([]);
  const reducedRef = useRef(false);
  const animatingRef = useRef(false);
  const openRef = useRef(open);

  // Header treatment: cream text over the dark hero / open menu, otherwise solid.
  const light = open || (isHome && !scrolled);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  // Scroll state for the solid/transparent switch.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Build the GSAP timeline + split the menu links once fonts are ready.
  useEffect(() => {
    const overlay = overlayRef.current;
    const menu = menuRef.current;
    if (!overlay || !menu) return;

    reducedRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let cleanedUp = false;

    const setup = () => {
      if (cleanedUp || reducedRef.current) return;
      const panels = overlay.querySelectorAll<HTMLElement>(".bal-panel");

      splitsRef.current = Array.from(
        menu.querySelectorAll<HTMLElement>("a"),
      ).map((el) =>
        SplitText.create(el, {
          type: "lines",
          mask: "lines",
          linesClass: "line",
        }),
      );

      const allLines = menu.querySelectorAll<HTMLElement>(".line");
      gsap.set(allLines, { yPercent: 110 });

      const tl = gsap.timeline({
        paused: true,
        onStart: () => {
          animatingRef.current = true;
        },
        onComplete: () => {
          animatingRef.current = false;
        },
        onReverseComplete: () => {
          animatingRef.current = false;
          overlay.classList.remove("is-open");
          document.body.classList.remove("is-locked");
          gsap.set(allLines, { yPercent: 110 });
        },
      });

      tl.to(panels, {
        scaleY: 1,
        duration: 0.7,
        stagger: 0.08,
        ease: "power3.inOut",
      });
      tl.to(
        menu,
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          duration: 0.7,
          ease: "power3.inOut",
        },
        "-=0.5",
      );

      tlRef.current = tl;
    };

    const revert = () => {
      splitsRef.current.forEach((s) => {
        s.revert();
      });
      splitsRef.current = [];
      tlRef.current?.kill();
      tlRef.current = null;
    };

    let resizeRaf = 0;
    const onResize = () => {
      window.cancelAnimationFrame(resizeRaf);
      resizeRaf = window.requestAnimationFrame(() => {
        if (openRef.current) return; // don't re-split mid-open
        revert();
        setup();
      });
    };

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => !cleanedUp && setup());
    } else {
      setup();
    }
    window.addEventListener("resize", onResize);

    return () => {
      cleanedUp = true;
      window.cancelAnimationFrame(resizeRaf);
      window.removeEventListener("resize", onResize);
      revert();
    };
  }, []);

  const animateLinksIn = useCallback(() => {
    const menu = menuRef.current;
    if (!menu) return;
    const groups = [
      menu.querySelectorAll<HTMLElement>(".bal-menu-meta .line"),
      menu.querySelectorAll<HTMLElement>(".bal-menu-primary .line"),
      menu.querySelectorAll<HTMLElement>(".bal-menu-secondary .line"),
    ];
    groups.forEach((lines, i) => {
      gsap.fromTo(
        lines,
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: 0.7,
          stagger: 0.05,
          ease: "power3.out",
          delay: 0.78 + i * 0.06,
        },
      );
    });
  }, []);

  const openMenu = useCallback(() => {
    const overlay = overlayRef.current;
    const menu = menuRef.current;
    if (!overlay || !menu) return;
    setOpen(true);
    overlay.classList.add("is-open");
    document.body.classList.add("is-locked");

    if (reducedRef.current || !tlRef.current) {
      gsap.set(overlay.querySelectorAll(".bal-panel"), { scaleY: 1 });
      gsap.set(menu, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      });
      gsap.set(menu.querySelectorAll(".line"), { yPercent: 0 });
      return;
    }
    tlRef.current.play();
    animateLinksIn();
  }, [animateLinksIn]);

  const closeMenu = useCallback(() => {
    const overlay = overlayRef.current;
    const menu = menuRef.current;
    if (!overlay || !menu) return;
    setOpen(false);

    if (reducedRef.current || !tlRef.current) {
      gsap.set(menu.querySelectorAll(".line"), { yPercent: 110 });
      gsap.set(menu, { clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)" });
      gsap.set(overlay.querySelectorAll(".bal-panel"), { scaleY: 0 });
      overlay.classList.remove("is-open");
      document.body.classList.remove("is-locked");
      return;
    }
    tlRef.current.reverse();
  }, []);

  const toggle = useCallback(() => {
    if (animatingRef.current && !reducedRef.current) return;
    if (open) closeMenu();
    else openMenu();
  }, [open, openMenu, closeMenu]);

  // Escape to close.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeMenu]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[70] transition-colors duration-500",
          light
            ? "bg-transparent"
            : "border-b border-line bg-parchment/85 backdrop-blur-md",
        )}
      >
        <div className="mx-auto flex h-[4.5rem] max-w-[100rem] items-center justify-between gap-6 px-5 sm:px-8">
          <Crest light={light} />

          <nav
            aria-label="Primary"
            className={cn(
              "hidden items-center gap-9 text-[0.82rem] font-medium uppercase tracking-[0.16em] lg:flex",
              light ? "text-cream" : "text-ink",
            )}
          >
            {primaryNav.map((l) => (
              <SvgUnderlineLink key={l.href} href={l.href}>
                {l.label}
              </SvgUnderlineLink>
            ))}
          </nav>

          <button
            type="button"
            onClick={toggle}
            aria-expanded={open}
            aria-controls="overlay-menu"
            className={cn(
              "group flex items-center gap-3 text-[0.78rem] font-semibold uppercase tracking-[0.18em] transition-colors",
              light ? "text-cream" : "text-ink",
            )}
          >
            <span className="hidden sm:inline">{open ? "Close" : "Menu"}</span>
            <span className="relative flex h-4 w-7 flex-col justify-center">
              <span
                className={cn(
                  "absolute h-px w-7 bg-current transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                  open ? "rotate-45" : "-translate-y-[5px]",
                )}
              />
              <span
                className={cn(
                  "absolute h-px w-7 bg-current transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                  open ? "-rotate-45" : "translate-y-[5px]",
                )}
              />
            </span>
          </button>
        </div>
      </header>

      {/* Fullscreen overlay menu */}
      <div
        id="overlay-menu"
        ref={overlayRef}
        className="bal-overlay"
        aria-hidden={!open}
        inert={!open}
      >
        <div className="bal-panel" />
        <div className="bal-panel" />
        <div className="bal-panel" />
        <div className="bal-panel" />

        <div
          ref={menuRef}
          className="bal-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
        >
          <div className="mx-auto flex h-full w-full max-w-[100rem] flex-col justify-between gap-12 px-5 pb-12 pt-28 sm:px-8 lg:flex-row lg:items-end lg:pb-16">
            {/* Primary — large display links */}
            <nav
              aria-label="Menu primary"
              className="bal-menu-primary flex flex-col gap-2 lg:gap-3"
            >
              {overlayPrimary.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={closeMenu}
                  className="text-[clamp(2.4rem,7vw,5rem)] font-light"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="flex flex-col gap-10 sm:flex-row sm:gap-16 lg:gap-20">
              {/* Secondary links */}
              <nav
                aria-label="Menu secondary"
                className="bal-menu-secondary flex flex-col gap-3 text-cream"
              >
                <p className="mb-2 text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-cream-muted">
                  Explore
                </p>
                {overlaySecondary.map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    onClick={closeMenu}
                    className="text-[1.05rem]"
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>

              {/* Meta — socials + contact */}
              <div className="bal-menu-meta flex flex-col gap-8 text-cream">
                <div className="flex flex-col gap-3">
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-cream-muted">
                    Follow
                  </p>
                  {socials.map((l) => (
                    <a key={l.label} href={l.href} className="text-[1.05rem]">
                      {l.label}
                    </a>
                  ))}
                </div>
                <div className="flex flex-col gap-2 text-[0.9rem] text-cream-muted">
                  <a href={site.contact.phoneHref}>{site.contact.phone}</a>
                  <a href={site.contact.emailHref}>{site.contact.email}</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
