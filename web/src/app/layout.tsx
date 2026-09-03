// src/app/layout.tsx
import type { Metadata } from "next";
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
    <html lang="fr" className="dark">
      <body className="bg-neutral-950 text-neutral-100 min-h-screen antialiased flex flex-col justify-between">
        <header className="border-b border-neutral-800 p-4 max-w-5xl mx-auto w-full flex items-center justify-between">
          <a href="/" className="font-bold text-xl tracking-tight text-white">
            Meetus<span className="text-neutral-500">.</span>
          </a>
          <small className="text-neutral-500">by Waabily</small>
        </header>

        <main className="max-w-5xl mx-auto w-full p-4 md:p-8 flex-1">
          {children}
        </main>

        <footer className="border-t border-neutral-900 p-4 text-center text-xs text-neutral-600">
          © {new Date().getFullYear()} Meetus. Tous droits réservés.
        </footer>
      </body>
    </html>
  );
}