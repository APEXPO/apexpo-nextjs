"use client";

import { useEffect } from "react";

const KEY = "apexpo_lang";

function readCookie(name: string): string | null {
  const prefix = `${encodeURIComponent(name)}=`;
  const parts = document.cookie.split("; ");
  for (const part of parts) {
    if (part.startsWith(prefix)) {
      return decodeURIComponent(part.slice(prefix.length));
    }
  }
  return null;
}

/** Mirrors middleware-set `apexpo_lang` cookie into localStorage for client code. */
export default function LangStorageSync() {
  useEffect(() => {
    const fromCookie = readCookie(KEY);
    if (fromCookie?.trim()) {
      const v = fromCookie.trim();
      if (localStorage.getItem(KEY) !== v) {
        localStorage.setItem(KEY, v);
      }
    }
  }, []);
  return null;
}
