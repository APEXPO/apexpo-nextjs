import type { Metadata } from "next";
import LanguagePicker from "@/components/onboarding/LanguagePicker";

export const metadata: Metadata = {
  title: "Choose language — Apexpo",
};

export default function LanguageOnboardingPage() {
  return <LanguagePicker />;
}
