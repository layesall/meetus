import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
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
    <html lang="fr" className="dark h-full">
      <body className="bg-neutral-950 text-neutral-100 min-h-dvh antialiased flex flex-col justify-between overflow-x-hidden">

        {/* HEADER */}
        <header className="w-full border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
          
          {/* Logo cliquable */}
          <Link 
            href="/" 
            className="group flex items-center gap-0.5 font-black text-2xl tracking-tight transition hover:opacity-90"
          >
            <span className="text-white">Meet</span>
            <span className="text-[#3B82F6]">us</span>
          </Link>

          <Link
            href="https://layesall.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition bg-neutral-900 border border-neutral-800 hover:border-neutral-700 px-3 py-1.5 rounded-full"
          >
            <span>Retour au site host</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </header>

        <main className="w-full flex-1 flex flex-col">
          {children}
        </main>

        <footer className="p-4 text-center text-xs text-neutral-600">
          © {new Date().getFullYear()} Meetus. Tous droits réservés.
        </footer>
      </body>
    </html>
  );
}