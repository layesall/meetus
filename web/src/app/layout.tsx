// app/layout.tsx
// Root layout — header only on homepage, signature badge everywhere.

import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { SignatureBadge } from "@/components/SignatureBadge";

export const metadata: Metadata = {
  title: "Meetus - Planificateur de rendez-vous",
  description: "Réservez un créneau en quelques clics.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="h-full">
      <body className="flex min-h-dvh flex-col bg-slate-50 text-slate-900 antialiased" suppressHydrationWarning>
        <Header />
        <main className="flex flex-1 flex-col">{children}</main>
        <SignatureBadge />
      </body>
    </html>
  );
}