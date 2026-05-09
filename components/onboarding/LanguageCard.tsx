"use client";

import { motion } from "framer-motion";

export type LanguageOption = {
  code: "en" | "cs" | "de" | "pl" | "es";
  flag: string;
  name: string;
  country: string;
};

export type LanguageCardProps = {
  language: LanguageOption;
  selected: boolean;
  isSelecting: boolean;
  onSelect: () => void;
  /** Extra classes on the outer `<li>` (e.g. `col-span-2` for a centered last row). */
  listItemClassName?: string;
  /** Extra classes on the button (e.g. `max-w-xs` when centered on a full-width grid row). */
  buttonClassName?: string;
};

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38 },
  },
};

export default function LanguageCard({
  language,
  selected,
  isSelecting,
  onSelect,
  listItemClassName = "",
  buttonClassName = "",
}: LanguageCardProps) {
  const { flag, name, country } = language;

  return (
    <motion.li
      className={["list-none", listItemClassName].filter(Boolean).join(" ")}
      variants={cardVariants}
    >
      <motion.button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        aria-label={`${name}, ${country}`}
        whileHover={
          isSelecting ? undefined : { scale: 1.01, transition: { duration: 0.15 } }
        }
        whileTap={{ scale: 0.98 }}
        animate={
          isSelecting ? { scale: 1.02, transition: { duration: 0.2 } } : {}
        }
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect();
          }
        }}
        className={[
          "group flex w-full items-center gap-5 rounded-xl border p-4 text-left text-white outline-none transition-all",
          "focus-visible:ring-2 focus-visible:ring-cyan-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black/50",
          selected
            ? "border-cyan-400/60 bg-cyan-400/15"
            : "border-white/10 bg-black/30 hover:border-white/30 hover:bg-black/45",
          buttonClassName,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span
          className="text-4xl leading-none transition-transform group-hover:scale-110"
          style={{
            fontFamily: '"Segoe UI Emoji", "Apple Color Emoji", sans-serif',
          }}
          aria-hidden
        >
          {flag}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xl font-semibold">{name}</span>
          <span className="mt-0.5 block text-sm text-white/55">{country}</span>
        </span>
      </motion.button>
    </motion.li>
  );
}
