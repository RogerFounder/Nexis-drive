import Link from "next/link";
import { listRecentLaudos } from "@/server/db/repositories/laudo.repository";

// Laudos change constantly — never bake the list into a build-time static page.
export const dynamic = "force-dynamic";

const DATE_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export default async function DashboardLaudoIndexPage() {
  const laudos = await listRecentLaudos();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">Laudos Técnicos</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Registros de entrada emitidos, com termos de garantia. Gere um novo a partir de um lead
          na aba Leads.
        </p>
      </div>

      {laudos.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-zinc-800 py-16 text-center">
          <p className="text-sm font-medium text-zinc-300">Nenhum laudo emitido ainda.</p>
          <p className="text-sm text-zinc-500">
            Abra um lead em Leads e clique em &quot;Gerar Laudo&quot;.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {laudos.map((laudo) => (
            <Link
              key={laudo.id}
              href={`/dashboard/laudo/${laudo.id}`}
              className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900 p-4 transition-colors duration-150 hover:border-zinc-700"
            >
              <div>
                <p className="font-medium text-zinc-50">
                  #{laudo.numero} · {laudo.clienteNome}
                </p>
                <p className="text-xs text-zinc-500">
                  {laudo.identificadorLabel}: {laudo.identificadorValor}
                </p>
              </div>
              <p className="text-xs text-zinc-500">{DATE_FORMATTER.format(laudo.createdAt)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
