"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import ApexpoLogo from "@/components/ApexpoLogo";
import CodeRain from "@/components/CodeRain";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { persistLocaleToProfile } from "@/lib/supabase/persistLocale";

/** First-visit gate + persisted preference for the landing overlay */
const OVERLAY_STORAGE_KEY = "apexpo_language";
/** Middleware / onboarding compatibility */
const LEGACY_LANG_KEY = "apexpo_lang";

const SUBTITLE_ROW =
  "Vyberte jazyk · Sprache wählen · Wybierz język · Elija idioma";

type OverlayLang = {
  code: string;
  native: string;
  flag: string;
  region: string;
  tagline: string;
};

const OVERLAY_LANGUAGES: OverlayLang[] = [
  {
    code: "en",
    native: "English",
    flag: "🇬🇧",
    region: "Global",
    tagline: "The system that never sleeps.",
  },
  {
    code: "cs",
    native: "Čeština",
    flag: "🇨🇿",
    region: "CZ / SK",
    tagline: "Systém, který nikdy nezhasne.",
  },
  {
    code: "de",
    native: "Deutsch",
    flag: "🇩🇪",
    region: "DE / AT / CH",
    tagline: "Das System, das nie schläft.",
  },
  {
    code: "pl",
    native: "Polski",
    flag: "🇵🇱",
    region: "PL",
    tagline: "System, który nigdy nie śpi.",
  },
  {
    code: "es",
    native: "Español",
    flag: "🇪🇸",
    region: "ES",
    tagline: "El sistema que nunca duerme.",
  },
];

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

/** Effective locale for badge + overlay skip (overlay key first, then legacy + cookie). */
function readStoredLang(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const primary = localStorage.getItem(OVERLAY_STORAGE_KEY)?.trim();
    if (primary) return primary;
    const legacy = localStorage.getItem(LEGACY_LANG_KEY)?.trim();
    if (legacy) {
      localStorage.setItem(OVERLAY_STORAGE_KEY, legacy);
      return legacy;
    }
  } catch {
    return null;
  }
  const fromCookie = readCookieLang();
  if (fromCookie) {
    try {
      localStorage.setItem(OVERLAY_STORAGE_KEY, fromCookie);
      localStorage.setItem(LEGACY_LANG_KEY, fromCookie);
    } catch {
      /* private mode */
    }
    return fromCookie;
  }
  return null;
}

function persistLanguageChoice(code: string) {
  try {
    localStorage.setItem(OVERLAY_STORAGE_KEY, code);
    localStorage.setItem(LEGACY_LANG_KEY, code);
  } catch {
    /* private mode */
  }
  document.cookie = `${LEGACY_LANG_KEY}=${encodeURIComponent(code)}; path=/; max-age=31536000`;
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
  const [overlaySelected, setOverlaySelected] = useState<string | null>(null);
  const [overlayExiting, setOverlayExiting] = useState(false);

  useEffect(() => {
    setLanguage(readStoredLang());
    setGate("ready");
  }, []);

  const handleLanguageSelect = useCallback(async (code: string) => {
    persistLanguageChoice(code);
    setLanguage(code);

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
  }, []);

  const showOverlay =
    showLanguageOverlay && gate === "ready" && !language;

  const handleOverlayPick = (lang: OverlayLang) => {
    if (overlayExiting) return;
    setOverlaySelected(lang.code);
    setOverlayExiting(true);
    window.setTimeout(() => {
      void handleLanguageSelect(lang.code);
    }, 650);
  };

  const langBadge =
    language?.trim() || readStoredLang()?.trim() || "en";

  return (
    <>
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

      {showOverlay ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="lang-overlay-title"
          className={overlayExiting ? "lang-overlay-exit" : undefined}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(2, 6, 23, 0.97)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            padding: "40px 20px",
            animation: "langFadeIn 0.5s ease forwards",
          }}
        >
          <style>{`
            @keyframes langFadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes langCardIn {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes langFadeOut {
              from { opacity: 1; }
              to { opacity: 0; pointer-events: none; }
            }
            .lang-overlay-exit {
              animation: langFadeOut 0.5s ease forwards !important;
            }
            .lang-card {
              transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
              cursor: pointer;
              border: 1.5px solid rgba(34, 211, 238, 0.1);
              background: rgba(10, 22, 40, 0.8);
              border-radius: 18px;
              padding: 28px 24px;
              text-align: left;
              position: relative;
              overflow: hidden;
              animation: langCardIn 0.5s ease both;
            }
            .lang-card:hover {
              border-color: rgba(34, 211, 238, 0.4) !important;
              transform: translateY(-5px);
              background: rgba(34, 211, 238, 0.06) !important;
              box-shadow: 0 12px 40px rgba(0,0,0,0.4);
            }
            .lang-card.selected {
              border-color: rgba(34, 211, 238, 0.75) !important;
              background: rgba(34, 211, 238, 0.1) !important;
              transform: scale(1.03);
              box-shadow: 0 0 40px rgba(34, 211, 238, 0.2);
            }
          `}</style>

          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              backgroundImage: `
                linear-gradient(rgba(34,211,238,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(34,211,238,0.03) 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "10%",
              top: "20%",
              width: 500,
              height: 500,
              borderRadius: "50%",
              background: "rgba(34,211,238,0.05)",
              filter: "blur(120px)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: "10%",
              bottom: "15%",
              width: 400,
              height: 400,
              borderRadius: "50%",
              background: "rgba(168,85,247,0.06)",
              filter: "blur(100px)",
              pointerEvents: "none",
            }}
          />

          <div style={{ marginBottom: 40, position: "relative", zIndex: 1 }}>
            <ApexpoLogo height={36} />
          </div>

          <div
            style={{
              fontFamily: "monospace",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.18em",
              color: "#22d3ee",
              marginBottom: 16,
              position: "relative",
              zIndex: 1,
            }}
          >
            KROK 0 / 10 — JAZYK
          </div>

          <h1
            id="lang-overlay-title"
            style={{
              fontSize: "clamp(26px, 3.5vw, 44px)",
              fontWeight: 800,
              color: "#f0f9ff",
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
              textAlign: "center",
              marginBottom: 12,
              position: "relative",
              zIndex: 1,
            }}
          >
            Vyberte svůj jazyk.
          </h1>

          <p
            style={{
              color: "#94a3b8",
              fontSize: "clamp(13px, 1.5vw, 15px)",
              textAlign: "center",
              marginBottom: 12,
              position: "relative",
              zIndex: 1,
              maxWidth: 520,
              lineHeight: 1.5,
            }}
          >
            {SUBTITLE_ROW}
          </p>

          <p
            style={{
              color: "#94a3b8",
              fontSize: "clamp(14px, 1.6vw, 17px)",
              textAlign: "center",
              marginBottom: 40,
              position: "relative",
              zIndex: 1,
            }}
          >
            Apexpo bude vždy mluvit vaším jazykem.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 16,
              width: "100%",
              maxWidth: 860,
              position: "relative",
              zIndex: 1,
            }}
          >
            {OVERLAY_LANGUAGES.map((lang, i) => (
              <button
                key={lang.code}
                type="button"
                className={`lang-card${overlaySelected === lang.code ? " selected" : ""}${lang.code === "es" ? " col-span-2 mx-auto max-w-xs w-full" : ""}`}
                style={{ animationDelay: `${0.1 + i * 0.08}s` }}
                onClick={() => handleOverlayPick(lang)}
              >
                {overlaySelected === lang.code ? (
                  <div
                    style={{
                      position: "absolute",
                      top: 14,
                      right: 14,
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #22d3ee, #a855f7)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="#020617"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                ) : null}

                <div style={{ fontSize: 36, marginBottom: 12, lineHeight: 1 }}>
                  {lang.flag}
                </div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color:
                      overlaySelected === lang.code ? "#22d3ee" : "#f0f9ff",
                    marginBottom: 4,
                    transition: "color 0.2s",
                  }}
                >
                  {lang.native}
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 14 }}>
                  {lang.region}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontStyle: "italic",
                    lineHeight: 1.5,
                    color:
                      overlaySelected === lang.code ? "#22d3ee" : "#475569",
                    transition: "color 0.2s",
                  }}
                >
                  {lang.tagline}
                </div>
              </button>
            ))}
          </div>

          <p
            style={{
              color: "#334155",
              fontSize: 13,
              marginTop: 32,
              textAlign: "center",
              position: "relative",
              zIndex: 1,
            }}
          >
            Další jazyky brzy — FR · IT · NL · a 150+ dalších do roku 2030.
          </p>
        </div>
      ) : null}
    </>
  );
}
