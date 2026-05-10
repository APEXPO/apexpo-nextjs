"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CodeRain from "@/components/CodeRain";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { persistLocaleToProfile } from "@/lib/supabase/persistLocale";
import LanguageSelector from "./LanguageSelector";

const LANG_STORAGE_KEY = "apexpo_lang";

function readStoredLang(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const ls = localStorage.getItem(LANG_STORAGE_KEY);
    if (ls?.trim()) return ls.trim();
  } catch {
    return null;
  }
  const prefix = `${encodeURIComponent(LANG_STORAGE_KEY)}=`;
  for (const part of document.cookie.split("; ")) {
    if (part.startsWith(prefix)) {
      const v = decodeURIComponent(part.slice(prefix.length));
      if (v?.trim()) return v.trim();
    }
  }
  return null;
}

function persistLangCookie(code: string) {
  try {
    localStorage.setItem(LANG_STORAGE_KEY, code);
  } catch {
    /* private mode */
  }
  document.cookie = `${LANG_STORAGE_KEY}=${encodeURIComponent(code)}; path=/; max-age=31536000`;
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

  useEffect(() => {
    setLanguage(readStoredLang());
    setGate("ready");
  }, []);

  const handleLanguageSelect = async (code: string) => {
    persistLangCookie(code);

    const supabase = createBrowserSupabaseClient();
    if (supabase) {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          await persistLocaleToProfile(supabase, session.user.id, code);
        }
      } catch {
        /* same as onboarding: local persist is enough if profile write fails */
      }
    }

    setLanguage(code);
  };

  const showOverlay =
    showLanguageOverlay && gate === "ready" && !language;

  const langBadge =
    language?.trim() || readStoredLang()?.trim() || "en";

  return (
    <>
      {showOverlay ? (
        <LanguageSelector onSelect={handleLanguageSelect} />
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
