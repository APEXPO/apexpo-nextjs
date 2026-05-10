import type { Metadata } from "next";
import LangStorageSync from "@/components/LangStorageSync";
import "./globals.css";

export const metadata: Metadata = {
  title: "Apexpo",
  description: "Apexpo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <LangStorageSync />
        {children}
      </body>
    </html>
  );
}
