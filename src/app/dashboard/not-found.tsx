import Link from "next/link";

export default function DashboardNotFound() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-zinc-800 py-20 text-center">
      <p className="text-sm font-medium text-zinc-500">Erro 404</p>
      <h1 className="text-xl font-semibold tracking-tight text-zinc-50">Registro não encontrado</h1>
      <p className="max-w-sm text-sm leading-relaxed text-zinc-400">
        O lead ou laudo que você tentou abrir não existe mais, ou o link está incorreto.
      </p>
      <Link
        href="/dashboard/leads"
        className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 transition-[transform,opacity] duration-150 hover:opacity-90 active:scale-[0.98]"
      >
        Voltar para Leads
      </Link>
    </div>
  );
}
