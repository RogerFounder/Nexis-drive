import { getActiveVertical } from "@/config/verticals";

const VERTICAL_SUBTITLE: Record<ReturnType<typeof getActiveVertical>, string> = {
  assistencia: "Assistência técnica premium para o seu dispositivo, do diagnóstico à entrega.",
  estetica: "Cuidado especializado para o seu veículo, com transparência do início ao fim.",
};

export default async function Home() {
  const vertical = getActiveVertical();

  // Dynamic import (not a static top-level import) so the bundler code-splits
  // per vertical — the inactive vertical's client component never ships to
  // the browser for this deployment.
  const LeadForm =
    vertical === "assistencia"
      ? (
          await import("@/components/shared/lead-forms/assistencia-tecnica-lead-form")
        ).AssistenciaTecnicaLeadForm
      : (
          await import("@/components/shared/lead-forms/estetica-motores-lead-form")
        ).EsteticaMotoresLeadForm;

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-16 px-6 py-20 sm:py-28">
        <header className="mx-auto max-w-lg text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
            Nexis Drive
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-zinc-500 dark:text-zinc-400">
            {VERTICAL_SUBTITLE[vertical]}
          </p>
        </header>

        <LeadForm />
      </main>
    </div>
  );
}
