import {
  getActiveVertical,
  VERTICAL_TAGLINE,
  VERTICAL_HIGHLIGHTS,
  MOTOR_MODE_TAGLINE,
} from "@/config/verticals";
import { getDeploymentSettings } from "@/server/db/repositories/settings.repository";
import { BackgroundMotif } from "@/components/shared/background-motif";

export default async function Home() {
  const vertical = getActiveVertical();
  const settings = vertical === "estetica" ? await getDeploymentSettings() : null;
  const tagline = settings?.motorServiceMode
    ? MOTOR_MODE_TAGLINE[settings.motorServiceMode]
    : VERTICAL_TAGLINE[vertical];
  const highlights = VERTICAL_HIGHLIGHTS[vertical];

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-zinc-950">
      <div
        aria-hidden
        className="animate-glow-a pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl"
      />
      <div
        aria-hidden
        className="animate-glow-b pointer-events-none absolute -right-24 -bottom-24 h-[28rem] w-[28rem] rounded-full bg-emerald-500/10 blur-3xl"
      />
      <BackgroundMotif vertical={vertical} />

      <main className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col items-center gap-12 px-6 py-20 sm:py-28">
        <header className="max-w-lg text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">
            Nexus Drive
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-zinc-400">{tagline}</p>

          <ul className="mx-auto mt-8 flex max-w-sm flex-col gap-3 text-left text-sm text-zinc-300">
            {highlights.map((highlight, index) => (
              <li key={highlight} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-zinc-300 ring-1 ring-zinc-700">
                  {index + 1}
                </span>
                {highlight}
              </li>
            ))}
          </ul>
        </header>

        <div className="w-full max-w-lg">
          {vertical === "assistencia" ? <AssistenciaForm /> : <EsteticaForm settings={settings} />}
        </div>
      </main>
    </div>
  );
}

// Dynamic import (not a static top-level import) so the bundler code-splits
// per vertical — the inactive vertical's client component never ships to the
// browser for this deployment.
async function AssistenciaForm() {
  const { AssistenciaTecnicaLeadForm } = await import(
    "@/components/shared/lead-forms/assistencia-tecnica-lead-form"
  );
  return <AssistenciaTecnicaLeadForm />;
}

async function EsteticaForm({
  settings,
}: {
  settings: Awaited<ReturnType<typeof getDeploymentSettings>>;
}) {
  const { EsteticaMotoresLeadForm } = await import(
    "@/components/shared/lead-forms/estetica-motores-lead-form"
  );
  return <EsteticaMotoresLeadForm motorServiceMode={settings?.motorServiceMode ?? null} />;
}
