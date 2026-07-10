import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-zinc-950 px-6 py-20 text-center">
      <p className="text-sm font-medium text-zinc-500">Erro 404</p>
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">Página não encontrada</h1>
      <p className="max-w-sm text-sm leading-relaxed text-zinc-400">
        O link que você seguiu pode estar quebrado, ou a página pode ter sido removida.
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 transition-[transform,opacity] duration-150 hover:opacity-90 active:scale-[0.98]"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
