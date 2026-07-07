import {
  getActiveVertical,
  VERTICAL_TAGLINE,
  VERTICAL_HIGHLIGHTS,
  MOTOR_MODE_TAGLINE,
} from "@/config/verticals";
import { getDeploymentSettings } from "@/server/db/repositories/settings.repository";

export default async function Home() {
  const vertical = getActiveVertical();
  const settings = vertical === "estetica" ? await getDeploymentSettings() : null;
  const tagline = settings?.motorServiceMode
    ? MOTOR_MODE_TAGLINE[settings.motorServiceMode]
    : VERTICAL_TAGLINE[vertical];
  const highlights = VERTICAL_HIGHLIGHTS[vertical];

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950 lg:grid lg:grid-cols-2">
      <aside
        aria-hidden
        className="relative hidden overflow-hidden bg-zinc-950 lg:flex lg:flex-col lg:justify-center lg:gap-10 lg:px-16 lg:py-20"
      >
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 -bottom-16 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative z-10 flex max-w-md flex-col gap-6">
          <h1 className="text-5xl font-semibold tracking-tight text-zinc-50">Nexus Drive</h1>
          <p className="text-lg leading-relaxed text-zinc-400">{tagline}</p>

          <ul className="mt-4 flex flex-col gap-4 text-sm text-zinc-300">
            {highlights.map((highlight, index) => (
              <li key={highlight} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-zinc-300 ring-1 ring-zinc-700">
                  {index + 1}
                </span>
                {highlight}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-16 px-6 py-20 sm:py-28 lg:max-w-none lg:items-center lg:justify-center lg:px-16 lg:py-20">
        <header className="mx-auto max-w-lg text-center lg:hidden">
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
            Nexus Drive
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-zinc-500 dark:text-zinc-400">
            {tagline}
          </p>
        </header>

        <div className="mx-auto w-full max-w-lg">
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
