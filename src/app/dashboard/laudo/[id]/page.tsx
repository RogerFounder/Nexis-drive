import { notFound } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { getLaudoById } from "@/server/db/repositories/laudo.repository";
import { getActiveVertical } from "@/config/verticals";
import { buildWarrantyText, buildWhatsAppSummary } from "@/lib/laudo-text";
import { LaudoActionsBar } from "@/components/shared/dashboard/laudo/laudo-actions-bar";

export const dynamic = "force-dynamic";

const DATE_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function LaudoDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const laudo = await getLaudoById(id);
  if (!laudo) notFound();

  const vertical = getActiveVertical();
  const warrantyText = buildWarrantyText(vertical);
  const whatsappSummary = buildWhatsAppSummary(laudo);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href="/dashboard/laudo"
          className="text-sm text-zinc-400 transition-colors duration-150 hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          ← Todos os laudos
        </Link>
        <LaudoActionsBar whatsappSummary={whatsappSummary} laudoId={laudo.id} />
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-8 sm:p-10 print:rounded-none print:border-none print:p-0 dark:border-zinc-800 dark:bg-zinc-900">
        <header className="flex items-start justify-between border-b border-zinc-200 pb-6 dark:border-zinc-800 print:border-zinc-300">
          <div>
            <p className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 print:text-black">
              Nexus Drive
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 print:text-zinc-600">
              Laudo Técnico de Entrada
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 print:text-black">
              Nº {laudo.numero}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 print:text-zinc-600">
              {DATE_FORMATTER.format(laudo.createdAt)}
            </p>
          </div>
        </header>

        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Cliente" value={laudo.clienteNome} />
          <Field label="WhatsApp" value={laudo.clienteWhatsapp} />
          <Field label={laudo.identificadorLabel} value={laudo.identificadorValor} />
        </section>

        <section className="mt-8">
          <SectionTitle>Condições registradas na entrada</SectionTitle>
          {laudo.itensChecklist.length > 0 ? (
            <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {laudo.itensChecklist.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 print:text-black"
                >
                  <span aria-hidden className="text-zinc-400">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400 print:text-zinc-600">
              Nenhuma avaria visível registrada na entrada.
            </p>
          )}
        </section>

        <section className="mt-6">
          <SectionTitle>Observações</SectionTitle>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 print:text-black">
            {laudo.observacoesEntrada}
          </p>
        </section>

        <section className="mt-8 rounded-2xl bg-zinc-50 p-5 dark:bg-zinc-800/60 print:rounded-none print:border print:border-zinc-300 print:bg-white">
          <SectionTitle>Garantia e Termos de Responsabilidade</SectionTitle>
          <p className="mt-3 whitespace-pre-line text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 print:text-zinc-700">
            {warrantyText}
          </p>
        </section>

        <section className="mt-12 grid grid-cols-1 gap-10 pt-6 text-center text-xs text-zinc-400 sm:grid-cols-2 print:text-zinc-500">
          <div className="border-t border-zinc-300 pt-2">Técnico Responsável</div>
          <div className="border-t border-zinc-300 pt-2">{laudo.clienteNome} (Cliente)</div>
        </section>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium tracking-wide text-zinc-400 uppercase print:text-zinc-500">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium text-zinc-900 dark:text-zinc-50 print:text-black">
        {value}
      </p>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold tracking-wider text-zinc-400 uppercase print:text-zinc-500">
      {children}
    </p>
  );
}
