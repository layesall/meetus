import Link from "next/link";
import { SearchX } from "lucide-react";

export default function BookingNotFound() {
  return (
    <div className="mx-auto w-full max-w-md px-6 py-20 text-center">
      <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400">
        <SearchX className="h-8 w-8" />
      </div>

      <h1 className="text-2xl font-bold text-slate-900">
        Prestation introuvable
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        Le lien est peut-être obsolète, ou la prestation a été retirée.
        Vous pouvez consulter la liste des prestations disponibles.
      </p>

      <Link
        href="/"
        className="mt-8 inline-flex items-center justify-center rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
      >
        Voir les prestations
      </Link>
    </div>
  );
}