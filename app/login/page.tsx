"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import DevLanguageResetButton from "@/components/dev/DevLanguageResetButton";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setError("Ověřování není dostupné. Zkontrolujte konfiguraci.");
      return;
    }
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#020617] px-6 py-12 text-[#f0f9ff]">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-2xl font-bold tracking-tight text-[#f0f9ff]">
          Přihlášení
        </h1>
        <p className="mt-2 text-center text-sm text-[#94a3b8]">
          Pokračujte e-mailem a heslem
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="login-email" className="text-sm font-medium text-[#cbd5e1]">
              E-mail
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[#f0f9ff] outline-none placeholder:text-[#64748b] focus:border-[#22d3ee]/40 focus:ring-2 focus:ring-[#22d3ee]/20"
              placeholder="vas@email.cz"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="login-password" className="text-sm font-medium text-[#cbd5e1]">
              Heslo
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[#f0f9ff] outline-none placeholder:text-[#64748b] focus:border-[#22d3ee]/40 focus:ring-2 focus:ring-[#22d3ee]/20"
              placeholder="••••••••"
            />
          </div>

          {error ? (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-full py-3 text-sm font-bold text-[#020617] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #22d3ee, #a855f7)",
            }}
          >
            {loading ? "Přihlašování…" : "Přihlásit se"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#94a3b8]">
          Nemáte účet?{" "}
          <Link
            href="/signup"
            className="font-semibold text-[#22d3ee] underline-offset-4 hover:underline"
          >
            Zaregistrujte se
          </Link>
        </p>

        <div className="mt-8 flex justify-center">
          <DevLanguageResetButton />
        </div>
      </div>
    </main>
  );
}
