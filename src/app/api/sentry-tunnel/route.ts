// Forwards browser-side Sentry events to Sentry's ingest API from our own
// origin, so the strict CSP (connect-src 'self' in src/proxy.ts) doesn't
// need to whitelist Sentry's ingest domains, and ad blockers that target
// sentry.io directly don't silently drop error reports.
//
// The envelope's DSN header names the destination, but that value comes
// from the client — so it's validated against Sentry's actual ingest
// hostname pattern before being used, closing off this route as an
// open proxy to arbitrary hosts.
const SENTRY_INGEST_HOST_PATTERN = /^o\d+\.ingest\.(?:(?:us|de)\.)?sentry\.io$/;

export async function POST(request: Request): Promise<Response> {
  const envelope = await request.text();
  const [headerLine] = envelope.split("\n");

  let dsn: URL;
  try {
    const header = JSON.parse(headerLine) as { dsn?: string };
    if (!header.dsn) throw new Error("missing dsn");
    dsn = new URL(header.dsn);
  } catch {
    return new Response(null, { status: 400 });
  }

  if (!SENTRY_INGEST_HOST_PATTERN.test(dsn.host)) {
    return new Response(null, { status: 400 });
  }

  const projectId = dsn.pathname.replace(/^\//, "");
  const ingestUrl = `https://${dsn.host}/api/${projectId}/envelope/`;

  try {
    const response = await fetch(ingestUrl, {
      method: "POST",
      body: envelope,
      headers: { "Content-Type": "application/x-sentry-envelope" },
    });
    return new Response(await response.text(), { status: response.status });
  } catch {
    return new Response(null, { status: 502 });
  }
}
