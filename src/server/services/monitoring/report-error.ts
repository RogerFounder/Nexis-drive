import * as Sentry from "@sentry/nextjs";

/**
 * Use for errors that are already caught and handled gracefully (a friendly
 * message is shown, the request doesn't throw) — Sentry's automatic Next.js
 * instrumentation only sees errors that actually propagate, so these would
 * otherwise be invisible outside the raw server logs. No-ops safely if
 * SENTRY_DSN isn't configured.
 */
export function reportError(scope: string, error: unknown): void {
  console.error(`[${scope}]`, error);
  Sentry.captureException(error, { tags: { scope } });
}
