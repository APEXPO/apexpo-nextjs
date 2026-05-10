"use client";

import { useState } from "react";
import ApexpoLogo from "@/components/ApexpoLogo";

const LANG_STORAGE_KEY = "apexpo_lang";

const LANGUAGES = [
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
];

type LanguageSelectorProps = {
  onSelect: (code: string) => void;
};

export default function LanguageSelector({ onSelect }: LanguageSelectorProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [exiting, setExiting] = useState(false);

  const handlePick = (lang: (typeof LANGUAGES)[number]) => {
    if (exiting) return;
    setSelected(lang.code);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang.code);
    } catch {
      /* SSR / private mode */
    }
    setExiting(true);
    window.setTimeout(() => onSelect(lang.code), 650);
  };

  return (
    <div
      className={exiting ? "lang-overlay-exit" : undefined}
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
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          width: "100%",
          maxWidth: 860,
          position: "relative",
          zIndex: 1,
        }}
      >
        {LANGUAGES.map((lang, i) => (
          <button
            key={lang.code}
            type="button"
            className={`lang-card${selected === lang.code ? " selected" : ""}`}
            style={{ animationDelay: `${0.1 + i * 0.08}s` }}
            onClick={() => handlePick(lang)}
          >
            {selected === lang.code && (
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
            )}

            <div style={{ fontSize: 36, marginBottom: 12, lineHeight: 1 }}>
              {lang.flag}
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: selected === lang.code ? "#22d3ee" : "#f0f9ff",
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
                color: selected === lang.code ? "#22d3ee" : "#475569",
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
        Další jazyky brzy — ES · FR · IT · NL · a 150+ dalších do roku 2030.
      </p>
    </div>
  );
}
