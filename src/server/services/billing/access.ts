import type { Admin, Subscription } from "@/generated/prisma/client";

/** Fallback used only where no Admin row is available yet (e.g. provisioning defaults). */
export const DEFAULT_TRIAL_DURATION_DAYS = 7;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

export type AccessReason = "SUBSCRIPTION_ACTIVE" | "TRIAL" | "EXPIRED";

export interface AccessState {
  allowed: boolean;
  reason: AccessReason;
  /** Days left in the free trial (0 once expired). Only meaningful when reason === "TRIAL". */
  trialDaysRemaining: number;
}

function trialEndsAt(trialStartedAt: Date, trialDurationDays: number): Date {
  return new Date(trialStartedAt.getTime() + trialDurationDays * MS_PER_DAY);
}

/**
 * Single source of truth for "can this admin use the dashboard right now".
 * A paid subscription wins outright; otherwise access falls back to the
 * per-admin trial window (trialDurationDays — 7 by default, but overridable
 * per deployment, e.g. for a promotional extended trial). Pure function —
 * pass `now` so it's deterministic and testable, defaulting to the real
 * clock in production.
 */
export function resolveAccessState(
  admin: Pick<Admin, "trialStartedAt" | "trialDurationDays"> & { subscription: Subscription | null },
  now: Date = new Date()
): AccessState {
  const sub = admin.subscription;

  if (sub && (sub.status === "ACTIVE" || sub.status === "TRIALING")) {
    const paidThroughValid = !sub.currentPeriodEnd || sub.currentPeriodEnd.getTime() > now.getTime();
    if (sub.status === "ACTIVE" && paidThroughValid) {
      return { allowed: true, reason: "SUBSCRIPTION_ACTIVE", trialDaysRemaining: 0 };
    }
  }

  const endsAt = trialEndsAt(admin.trialStartedAt, admin.trialDurationDays);
  const msRemaining = endsAt.getTime() - now.getTime();

  if (msRemaining > 0) {
    return {
      allowed: true,
      reason: "TRIAL",
      trialDaysRemaining: Math.ceil(msRemaining / MS_PER_DAY),
    };
  }

  return { allowed: false, reason: "EXPIRED", trialDaysRemaining: 0 };
}
