"use client";

import { useRouter } from "next/navigation";

export default function DevLanguageResetButton() {
  const router = useRouter();

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => {
        localStorage.clear();
        router.push("/onboarding/language");
      }}
      className="fixed bottom-4 right-4 z-[100] text-xs opacity-50 hover:opacity-80"
    >
      Reset language
    </button>
  );
}
