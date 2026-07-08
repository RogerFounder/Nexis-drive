import * as Sentry from "@sentry/nextjs";

// No-ops (Sentry.init with an empty dsn disables the SDK) until SENTRY_DSN
// is set — safe to deploy before the Sentry project exists.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  enabled: Boolean(process.env.SENTRY_DSN),
});
