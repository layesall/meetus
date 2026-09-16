import type { Metadata } from "next";
import Link from "next/link";
import { SignatureBadge } from "@/components/SignatureBadge";
import "./globals.css";

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
      <body className="bg-slate-50 text-slate-900 min-h-dvh antialiased flex flex-col overflow-x-hidden">
        <header className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link
              href="/"
              className="flex items-center gap-0.5 font-black text-2xl tracking-tight transition hover:opacity-80"
            >
              <span className="text-slate-900">Meet</span>
              <span className="text-sky-500">us</span>
            </Link>
          </div>
        </header>

        <main className="w-full flex-1 flex flex-col">
          {children}
        </main>

        <SignatureBadge />
      </body>
    </html>
  );
}