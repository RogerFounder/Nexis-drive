import { defaultChecklistItems } from "@/config/condition-checklist";
import { getSettingsByAdminId } from "@/server/db/repositories/settings.repository";
import type { Vertical } from "@/config/verticals";

export async function getEffectiveChecklistItems(
  adminId: string,
  vertical: Vertical
): Promise<readonly string[]> {
  const settings = await getSettingsByAdminId(adminId);
  if (settings && settings.checklistItems.length > 0) {
    return settings.checklistItems;
  }
  return defaultChecklistItems(vertical, settings?.motorServiceMode ?? null);
}
