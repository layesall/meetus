// app/book/[slug]/page.tsx
// Dashboard-like shell: fixed sidebar, main scrolls independently.

import { notFound } from "next/navigation";
import { fetchEventTypeBySlug } from "@/lib/api";
import { BookingSidebar } from "@/components/BookingSidebar";
import { BookingWizard } from "@/components/BookingWizard";
import { LogoMeetus } from "@/components/LogoMeetus";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BookPage({ params }: PageProps) {
  const { slug } = await params;

  let event;
  try {
    event = await fetchEventTypeBySlug(slug);
  } catch {
    notFound();
  }

  return (
    <>
      <LogoMeetus
        fallback="https://layesall.com"
        className="fixed right-4 top-4 z-40 rounded-full border border-slate-200 bg-white/80 px-3.5 py-2 text-sm shadow-sm backdrop-blur opacity-80 hover:border-slate-300 hover:opacity-100 hover:shadow-md lg:right-6 lg:top-6"
      />

      {/* Dashboard shell — viewport height, main scrolls alone */}
      <div className="flex h-dvh w-full overflow-hidden bg-slate-50">
        {/* Desktop sidebar — fixed panel, own scrollbar */}
        <aside className="hidden w-[360px] shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
          <BookingSidebar event={event} />
        </aside>

        {/* Main — independent scroll */}
        <main className="flex-1 overflow-y-auto">
          {/* Mobile — sidebar stacked on top, no fixed height */}
          <div className="border-b border-slate-200 bg-white lg:hidden">
            <BookingSidebar event={event} />
          </div>

          <div className="p-6 lg:p-10">
            <BookingWizard event={event} />
          </div>
        </main>
      </div>
    </>
  );
}