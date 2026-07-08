import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  tracesSampleRate: 0.1,
  // Routes events through our own /api/sentry-tunnel instead of hitting
  // sentry.io directly, so the strict connect-src CSP stays scoped to
  // 'self' and ad blockers targeting sentry.io don't drop reports.
  tunnel: "/api/sentry-tunnel",
});

// Required by the SDK to trace client-side navigations between routes.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
