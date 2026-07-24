import { notFound } from "next/navigation";
import { getCampaignStats } from "@/server/db/repositories/checkout-session.repository";

// Checkout sessions accrue continuously — never bake counts into a build-time static page.
export const dynamic = "force-dynamic";

export default async function CampanhasPage() {
  // Same gate as /landing — CheckoutSession only ever gets rows on the
  // flagship deployment, so this report is meaningless (and empty) elsewhere.
  if (process.env.ENABLE_MARKETING_LANDING !== "true") {
    notFound();
  }

  const stats = await getCampaignStats();
  const totalCheckouts = stats.reduce((sum, row) => sum + row.total, 0);
  const totalPaid = stats.reduce((sum, row) => sum + row.paid, 0);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">Campanhas</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Checkouts iniciados por origem de anúncio (UTM) — {totalCheckouts} no total,{" "}
          {totalPaid} pagos.
        </p>
      </div>

      {stats.length === 0 ? (
        <p className="text-sm text-zinc-500">Nenhum checkout registrado ainda.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-900/60 text-xs tracking-wide text-zinc-500 uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Origem</th>
                <th className="px-4 py-3 font-medium">Mídia</th>
                <th className="px-4 py-3 font-medium">Campanha</th>
                <th className="px-4 py-3 font-medium">Conteúdo</th>
                <th className="px-4 py-3 font-medium">Termo</th>
                <th className="px-4 py-3 text-right font-medium">Checkouts</th>
                <th className="px-4 py-3 text-right font-medium">Pagos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {stats.map((row, i) => (
                <tr key={i}>
                  <td className="px-4 py-3 text-zinc-100">{row.utmSource ?? "— direto —"}</td>
                  <td className="px-4 py-3 text-zinc-400">{row.utmMedium ?? "—"}</td>
                  <td className="px-4 py-3 text-zinc-400">{row.utmCampaign ?? "—"}</td>
                  <td className="px-4 py-3 text-zinc-400">{row.utmContent ?? "—"}</td>
                  <td className="px-4 py-3 text-zinc-400">{row.utmTerm ?? "—"}</td>
                  <td className="px-4 py-3 text-right text-zinc-100">{row.total}</td>
                  <td className="px-4 py-3 text-right text-emerald-400">{row.paid}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
