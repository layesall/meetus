import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { fetchEventTypeBySlug } from "@/lib/api";
import { BookingSidebar } from "@/components/BookingSidebar";
import { BookingWizard } from "@/components/BookingWizard";

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
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux prestations
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
        <BookingSidebar event={event} />
        <BookingWizard event={event} />
      </div>
    </div>
  );
}