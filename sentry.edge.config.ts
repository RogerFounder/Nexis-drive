import * as Sentry from "@sentry/nextjs";

// Covers src/proxy.ts, which runs on the Edge runtime — separate init from
// sentry.server.config.ts because the Edge runtime can't use Node APIs.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  enabled: Boolean(process.env.SENTRY_DSN),
});
