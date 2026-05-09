"use client";

import type { Session } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import ApexpoLogo from "@/components/ApexpoLogo";
import CodeRain from "@/components/CodeRain";
import MarketingLanding from "@/components/landing/MarketingLanding";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import LanguageCard, { type LanguageOption } from "./LanguageCard";

type LanguagePickerRow =
  | { kind: "subtitle"; text: string }
  | ({ kind: "language" } & LanguageOption);

/**
 * Single source of truth for all copy on this screen (subtitle + options).
 */
export const LANGUAGES: LanguagePickerRow[] = [
  {
    kind: "subtitle",
    text: "Vyberte jazyk · Sprache wählen · Wybierz język · Elija idioma",
  },
  {
    kind: "language",
    code: "en",
    flag: "🇬🇧",
    name: "English",
    country: "United Kingdom",
  },
  {
    kind: "language",
    code: "cs",
    flag: "🇨🇿",
    name: "Čeština",
    country: "Česká republika",
  },
  {
    kind: "language",
    code: "de",
    flag: "🇩🇪",
    name: "Deutsch",
    country: "Deutschland",
  },
  {
    kind: "language",
    code: "pl",
    flag: "🇵🇱",
    name: "Polski",
    country: "Polska",
  },
  {
    kind: "language",
    code: "es",
    flag: "🇪🇸",
    name: "Español",
    country: "España",
  },
];

function isLanguageRow(
  row: LanguagePickerRow,
): row is { kind: "language" } & LanguageOption {
  return row.kind === "language";
}

const STORAGE_KEY = "apexpo_lang";

function persistLanguage(code: string) {
  localStorage.setItem(STORAGE_KEY, code);
  document.cookie = `apexpo_lang=${encodeURIComponent(code)}; path=/; max-age=31536000`;
}

export default function LanguagePicker() {
  const router = useRouter();
  const [gate, setGate] = useState<"checking" | "picker">("checking");
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [selectingCode, setSelectingCode] = useState<string | null>(null);
  const pendingHrefRef = useRef<string | null>(null);
  const selectionLockRef = useRef(false);

  const subtitleRow = useMemo(
    () => LANGUAGES.find((r): r is Extract<LanguagePickerRow, { kind: "subtitle" }> => r.kind === "subtitle"),
    [],
  );

  const languageRows = useMemo(
    () => LANGUAGES.filter(isLanguageRow),
    [],
  );

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        if (!cancelled) setGate("picker");
        return;
      }

      const supabase = createBrowserSupabaseClient();

      let session: Session | null = null;
      try {
        if (supabase) {
          const { data } = await supabase.auth.getSession();
          session = data.session;
        }
      } catch {
        session = null;
      }

      if (cancelled) return;

      if (session) {
        router.replace("/dashboard");
        return;
      }

      router.replace("/signup");
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const finishExit = useCallback(() => {
    const href = pendingHrefRef.current;
    pendingHrefRef.current = null;
    if (href) router.push(href);
  }, [router]);

  const handleSelect = useCallback((code: string) => {
    if (selectionLockRef.current || pendingHrefRef.current) return;
    selectionLockRef.current = true;

    persistLanguage(code);
    setSelectedCode(code);
    setSelectingCode(code);

    pendingHrefRef.current = `/signup?lang=${encodeURIComponent(code)}`;

    window.setTimeout(() => {
      setSelectingCode(null);
      setOverlayVisible(false);
    }, 320);
  }, []);

  const subtitleText = subtitleRow?.text ?? "";

  const landingBackdrop = (
    <div
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
      aria-hidden
    >
      <div className="absolute inset-0 z-0 h-full w-full">
        <CodeRain opacity={0.65} />
      </div>
      <MarketingLanding showCodeRain={false} />
    </div>
  );

  const frostedOverlay = (
    <div
      className="fixed inset-0 z-10 bg-black/10 backdrop-blur-sm pointer-events-none"
      aria-hidden
    />
  );

  if (gate !== "picker") {
    return (
      <>
        {landingBackdrop}
      </>
    );
  }

  return (
    <>
      {landingBackdrop}
      {frostedOverlay}
      <AnimatePresence mode="wait" onExitComplete={finishExit}>
        {overlayVisible ? (
          <motion.div
            key="language-overlay"
            role="presentation"
            className="fixed inset-0 z-20 flex min-h-screen items-center justify-center p-6 pointer-events-none"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.38 }}
          >
            <div className="relative z-20 w-full max-w-2xl pointer-events-auto">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="rounded-2xl border border-white/20 bg-transparent p-8 shadow-none"
              >
                <div className="mb-8 flex flex-col items-center text-center">
                  <div className="mb-4 flex justify-center">
                    <ApexpoLogo height={40} />
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight text-white">
                    Choose your language
                  </h2>
                  <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/60">
                    {subtitleText}
                  </p>
                </div>

                <motion.ul
                  className="grid grid-cols-2 gap-4"
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: {},
                    show: {
                      transition: {
                        staggerChildren: 0.08,
                        delayChildren: 0.12,
                      },
                    },
                  }}
                >
                  {languageRows.map((lang) => (
                    <LanguageCard
                      key={lang.code}
                      language={lang}
                      selected={selectedCode === lang.code}
                      isSelecting={selectingCode === lang.code}
                      onSelect={() => handleSelect(lang.code)}
                      listItemClassName={
                        lang.code === "es"
                          ? "col-span-2 flex justify-center"
                          : undefined
                      }
                      buttonClassName={
                        lang.code === "es" ? "max-w-xs mx-auto" : undefined
                      }
                    />
                  ))}
                </motion.ul>
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
