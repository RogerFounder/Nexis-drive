import { redirect } from "next/navigation";
import { getCurrentAdminSession } from "@/server/services/auth/current-admin";
import { getAdminWithSubscription } from "@/server/db/repositories/admin.repository";
import { resolveAccessState, type AccessState } from "./access";

export interface DashboardAccess {
  adminId: string;
  email: string;
  access: AccessState;
}

/**
 * Gate used by dashboard Server Components/Actions. The proxy middleware
 * already guarantees a valid session before this runs, but billing state
 * lives in the DB (not the JWT) so it must be checked here, in Node context.
 * Expired trial without an active subscription → bounce to the paywall.
 */
export async function requireDashboardAccess(): Promise<DashboardAccess> {
  const state = await loadDashboardAccess();
  if (!state.access.allowed) redirect("/assinatura");
  return state;
}

/**
 * Same session/admin resolution as requireDashboardAccess, but returns the
 * access state (allowed or not) instead of bouncing to the paywall — used by
 * the /assinatura page itself, which must render for expired admins.
 */
export async function loadDashboardAccess(): Promise<DashboardAccess> {
  const session = await getCurrentAdminSession();
  if (!session) redirect("/login");

  const admin = await getAdminWithSubscription(session.adminId);
  if (!admin) redirect("/login");

  return { adminId: admin.id, email: admin.email, access: resolveAccessState(admin) };
}
