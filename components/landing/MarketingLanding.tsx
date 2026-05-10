"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CodeRain from "@/components/CodeRain";

const OVERLAY_STORAGE_KEY = "apexpo_language";
const LEGACY_LANG_KEY = "apexpo_lang";

const LANG_BUTTONS = [
  { code: "en", label: "EN" },
  { code: "cs", label: "CS" },
  { code: "de", label: "DE" },
  { code: "pl", label: "PL" },
  { code: "es", label: "ES" },
] as const;

function readCookieLang(): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${encodeURIComponent(LEGACY_LANG_KEY)}=`;
  for (const part of document.cookie.split("; ")) {
    if (part.startsWith(prefix)) {
      const v = decodeURIComponent(part.slice(prefix.length));
      if (v?.trim()) return v.trim();
    }
  }
  return null;
}

/** Badge + UI: prefer apexpo_language, then legacy storage / cookie */
function readStoredLang(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const primary = localStorage.getItem(OVERLAY_STORAGE_KEY)?.trim();
    if (primary) return primary;
    const legacy = localStorage.getItem(LEGACY_LANG_KEY)?.trim();
    if (legacy) return legacy;
  } catch {
    return null;
  }
  return readCookieLang();
}

type MarketingLandingProps = {
  /** When false, skip matrix (e.g. language picker provides its own fixed backdrop). */
  showCodeRain?: boolean;
  /** When false, do not mount the first-visit language overlay (e.g. embedded behind onboarding picker). */
  showLanguageOverlay?: boolean;
};

/**
 * Lightweight marketing shell used as the blurred backdrop behind onboarding.
 * Keeps the route visually aligned with the main landing without pulling in nav/footer here.
 */
export default function MarketingLanding({
  showCodeRain = true,
  showLanguageOverlay = true,
}: MarketingLandingProps) {
  const [gate, setGate] = useState<"checking" | "ready">("checking");
  const [language, setLanguage] = useState<string | null>(null);
  const [showLangOverlay, setShowLangOverlay] = useState(false);

  useEffect(() => {
    setLanguage(readStoredLang());
    try {
      const hasChoice = Boolean(
        localStorage.getItem(OVERLAY_STORAGE_KEY)?.trim(),
      );
      setShowLangOverlay(showLanguageOverlay && !hasChoice);
    } catch {
      setShowLangOverlay(showLanguageOverlay);
    }
    setGate("ready");
  }, [showLanguageOverlay]);

  const showOverlay =
    showLanguageOverlay && gate === "ready" && showLangOverlay;

  const pickLanguage = (code: string) => {
    try {
      localStorage.setItem(OVERLAY_STORAGE_KEY, code);
    } catch {
      /* private mode */
    }
    setLanguage(code);
    setShowLangOverlay(false);
  };

  const langBadge =
    language?.trim() || readStoredLang()?.trim() || "en";

  return (
    <>
      {showOverlay ? (
        <div
          className="fixed inset-0 flex flex-col items-center justify-center gap-6 bg-[#020617] p-6"
          style={{ zIndex: 9999 }}
          role="dialog"
          aria-modal="true"
          aria-label="Choose language"
        >
          <p className="text-center text-sm font-medium text-[#94a3b8]">
            Choose your language
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {LANG_BUTTONS.map(({ code, label }) => (
              <button
                key={code}
                type="button"
                onClick={() => pickLanguage(code)}
                className="min-w-[4.5rem] rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-base font-bold tracking-wide text-[#f0f9ff] transition-colors hover:border-[#22d3ee]/40 hover:bg-[#22d3ee]/10"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div
        className={
          showCodeRain
            ? "relative min-h-screen overflow-hidden bg-[#020617] text-[#f0f9ff]"
            : "relative z-[1] min-h-screen overflow-hidden bg-transparent text-[#f0f9ff]"
        }
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34,211,238,0.12), transparent), radial-gradient(ellipse 60% 40% at 100% 50%, rgba(168,85,247,0.08), transparent)",
          filter: showOverlay ? "blur(4px)" : undefined,
          pointerEvents: showOverlay ? "none" : undefined,
        }}
      >
        {showCodeRain ? (
          <div className="pointer-events-none absolute inset-0 z-0">
            <CodeRain opacity={0.65} />
          </div>
        ) : null}
        <div className="relative z-10 mx-auto max-w-6xl px-6 pb-32 pt-28 lg:px-10 lg:pt-36">
          <nav className="mb-10 flex flex-wrap items-center justify-end gap-3 sm:mb-14">
            <Link
              href="/login"
              className="rounded-full border px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{
                borderColor: "rgba(34,211,238,0.3)",
                color: "#22d3ee",
                backgroundColor: "transparent",
              }}
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="rounded-full px-4 py-2 text-sm font-bold text-[#020617] transition-opacity hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #22d3ee, #a855f7)",
              }}
            >
              Sign Up
            </Link>
            <span
              className="inline-flex min-w-[2.25rem] items-center justify-center rounded-full border border-white/15 bg-white/5 px-2.5 py-1.5 font-mono text-[11px] font-semibold tabular-nums tracking-wide text-[#22d3ee]"
              aria-label="Current language"
            >
              {langBadge.toUpperCase().slice(0, 2)}
            </span>
          </nav>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5">
            <span
              className="h-1.5 w-1.5 rounded-full bg-[#22d3ee]"
              aria-hidden
            />
            <span className="font-mono text-[11px] font-semibold tracking-widest text-[#22d3ee]">
              APEXPO
            </span>
          </div>
          <h1 className="mt-10 max-w-3xl font-sans text-[clamp(2rem,5vw,3.75rem)] font-extrabold leading-[1.05] tracking-tight">
            Trade shows,{" "}
            <span className="bg-gradient-to-r from-[#22d3ee] to-[#a855f7] bg-clip-text text-transparent">
              reimagined
            </span>
            .
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#94a3b8]">
            Full-screen preview of your landing — scrollable behind the language
            overlay with blur and dimming applied by the picker layer.
          </p>
        </div>
      </div>
    </>
  );
}
