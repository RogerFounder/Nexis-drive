import { getActiveVertical } from "@/config/verticals";
import { defaultChecklistItems } from "@/config/condition-checklist";
import { getSettingsByAdminId } from "@/server/db/repositories/settings.repository";
import { requireDashboardAccess } from "@/server/services/billing/require-access";
import { SettingsForm } from "@/components/shared/dashboard/settings/settings-form";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
  const { adminId } = await requireDashboardAccess();
  const vertical = getActiveVertical();
  const settings = await getSettingsByAdminId(adminId);

  const initialChecklistItems =
    settings && settings.checklistItems.length > 0
      ? settings.checklistItems
      : defaultChecklistItems(vertical, settings?.motorServiceMode ?? null);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Configurações
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Ajuste como o seu negócio aparece no sistema. Você pode editar isso quando quiser.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <SettingsForm
          vertical={vertical}
          initialMotorServiceMode={settings?.motorServiceMode ?? null}
          initialChecklistItems={initialChecklistItems}
        />
      </div>
    </div>
  );
}
