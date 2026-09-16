import Link from "next/link";
import { CheckCircle2, Calendar, Mail, XCircle } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ id?: string; token?: string }>;
}

export default async function SuccessPage({ searchParams }: PageProps) {
  const { id, token } = await searchParams;
  const cancelHref =
    id && token ? `/cancel?id=${id}&token=${token}` : null;

  return (
    <div className="mx-auto w-full max-w-md px-6 py-16 text-center">
      <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600">
        <CheckCircle2 className="h-8 w-8" />
      </div>

      <h1 className="text-2xl font-bold text-slate-900">
        Rendez-vous confirmé
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        Un e-mail contenant les détails du rendez-vous et le lien de connexion
        (Google Meet le cas échéant) vient de vous être envoyé.
      </p>

      <ul className="mt-8 space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-left text-sm shadow-sm">
        <li className="flex items-start gap-3">
          <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" />
          <span className="text-slate-700">
            Ajoutez-le à votre agenda pour ne pas le manquer.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <Mail className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" />
          <span className="text-slate-700">
            L'invitation contient le lien de la visio et un bouton d'annulation.
          </span>
        </li>
      </ul>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Retour à l'accueil
        </Link>
        {cancelHref && (
          <Link
            href={cancelHref}
            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          >
            <XCircle className="h-4 w-4" />
            Annuler ce rendez-vous
          </Link>
        )}
      </div>
    </div>
  );
}