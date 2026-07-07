import { describe, expect, it } from "vitest";
import { resolveAccessState, DEFAULT_TRIAL_DURATION_DAYS } from "./access";

const DAY_MS = 1000 * 60 * 60 * 24;

function admin(overrides: {
  trialStartedAt: Date;
  trialDurationDays?: number;
  subscription?: Parameters<typeof resolveAccessState>[0]["subscription"];
}) {
  return {
    trialStartedAt: overrides.trialStartedAt,
    trialDurationDays: overrides.trialDurationDays ?? DEFAULT_TRIAL_DURATION_DAYS,
    subscription: overrides.subscription ?? null,
  };
}

describe("resolveAccessState", () => {
  const now = new Date("2026-01-15T12:00:00Z");

  it("allows access on day 1 of the default 7-day trial", () => {
    const state = resolveAccessState(admin({ trialStartedAt: now }), now);
    expect(state).toEqual({ allowed: true, reason: "TRIAL", trialDaysRemaining: 7 });
  });

  it("counts down trialDaysRemaining as the trial elapses", () => {
    const startedAt = new Date(now.getTime() - 3 * DAY_MS);
    const state = resolveAccessState(admin({ trialStartedAt: startedAt }), now);
    expect(state.allowed).toBe(true);
    expect(state.reason).toBe("TRIAL");
    expect(state.trialDaysRemaining).toBe(4);
  });

  it("expires exactly at trialStartedAt + trialDurationDays", () => {
    const startedAt = new Date(now.getTime() - DEFAULT_TRIAL_DURATION_DAYS * DAY_MS);
    const state = resolveAccessState(admin({ trialStartedAt: startedAt }), now);
    expect(state).toEqual({ allowed: false, reason: "EXPIRED", trialDaysRemaining: 0 });
  });

  it("respects a custom trialDurationDays (e.g. a 30-day promotional trial)", () => {
    const startedAt = new Date(now.getTime() - 10 * DAY_MS);
    const state = resolveAccessState(
      admin({ trialStartedAt: startedAt, trialDurationDays: 30 }),
      now
    );
    expect(state.allowed).toBe(true);
    expect(state.trialDaysRemaining).toBe(20);
  });

  it("grants access for an ACTIVE subscription regardless of trial state", () => {
    const longExpiredTrial = new Date(now.getTime() - 100 * DAY_MS);
    const state = resolveAccessState(
      admin({
        trialStartedAt: longExpiredTrial,
        subscription: {
          status: "ACTIVE",
          currentPeriodEnd: new Date(now.getTime() + DAY_MS),
        } as never,
      }),
      now
    );
    expect(state).toEqual({ allowed: true, reason: "SUBSCRIPTION_ACTIVE", trialDaysRemaining: 0 });
  });

  it("falls back to trial/expired if an ACTIVE subscription's currentPeriodEnd has passed", () => {
    const state = resolveAccessState(
      admin({
        trialStartedAt: new Date(now.getTime() - 100 * DAY_MS),
        subscription: {
          status: "ACTIVE",
          currentPeriodEnd: new Date(now.getTime() - DAY_MS),
        } as never,
      }),
      now
    );
    expect(state.reason).toBe("EXPIRED");
    expect(state.allowed).toBe(false);
  });

  it("does not grant access for a PAST_DUE or CANCELED subscription on its own", () => {
    const state = resolveAccessState(
      admin({
        trialStartedAt: new Date(now.getTime() - 100 * DAY_MS),
        subscription: { status: "CANCELED", currentPeriodEnd: null } as never,
      }),
      now
    );
    expect(state).toEqual({ allowed: false, reason: "EXPIRED", trialDaysRemaining: 0 });
  });

  it("treats a TRIALING subscription status as still governed by the trial window, not auto-allowed", () => {
    const state = resolveAccessState(
      admin({
        trialStartedAt: new Date(now.getTime() - 100 * DAY_MS),
        subscription: { status: "TRIALING", currentPeriodEnd: null } as never,
      }),
      now
    );
    expect(state.reason).toBe("EXPIRED");
  });
});
