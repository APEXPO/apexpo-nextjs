import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Writes locale to `public.profiles` for the signed-in user.
 * Call only when `auth.getSession()` returns a user (RLS requires it).
 */
export async function persistLocaleToProfile(
  supabase: SupabaseClient,
  userId: string,
  locale: string,
): Promise<void> {
  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      locale,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) throw error;
}
