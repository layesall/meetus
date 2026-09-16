export default function HomeLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-16">
      <div className="mb-12 text-center">
        <div className="mx-auto mb-3 h-6 w-40 animate-pulse rounded-full bg-slate-200" />
        <div className="mx-auto h-8 w-72 animate-pulse rounded bg-slate-200" />
        <div className="mx-auto mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-slate-100" />
      </div>

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <li
            key={i}
            className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-4 h-1.5 w-12 animate-pulse rounded-full bg-slate-200" />
            <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 space-y-2">
              <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
              <div className="h-3 w-5/6 animate-pulse rounded bg-slate-100" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
            </div>
            <div className="mt-5 flex items-center justify-between">
              <div className="h-4 w-16 animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-14 animate-pulse rounded bg-slate-200" />
            </div>
            <div className="mt-6 h-10 w-full animate-pulse rounded-lg bg-slate-100" />
          </li>
        ))}
      </ul>
    </div>
  );
}