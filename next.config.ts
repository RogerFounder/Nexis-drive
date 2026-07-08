import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

// Source map upload (readable stack traces in Sentry) only runs when
// SENTRY_ORG/SENTRY_PROJECT/SENTRY_AUTH_TOKEN are set — harmless no-op
// otherwise, so this is safe before the Sentry project exists.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  widenClientFileUpload: false,
});
