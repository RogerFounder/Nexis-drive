# NEXIS-DRIVE ARCHITECTURE MANIFESTO

## Engineering rules
- NEVER use placeholders or incomplete code like '// TODO'. Write production-ready blocks.
- SECURITY: Mitigate OWASP Top 10 natively with Zod validation and secure middlewares.
- UX/UI: High-end bespoke aesthetics. Animations must focus on high-performance hardware acceleration (transform/opacity) at 60fps, inspired by Apple's digital craftsmanship.
- MODULARITY: The product is multi-vertical (Assistência Técnica, Estética de Motores, and any future ones). Which verticals are active for a given client must be driven by configuration, not hardcoded page composition. An inactive vertical's UI, routes, and components must be fully isolated from the bundle/output the end user reaches — never rendered, linked, or shipped dark/disabled.

## Product scope — "Antigravity" system (5 non-negotiable pillars)

Nexis Drive is a white-label SaaS built on the Antigravity system design. Every implementation decision must trace back to one of these five pillars — this is the definitive scope, kept here so it survives context resets.

1. **Modular architecture (Option A) — white-label.** A single environment variable, `VERTENTE_ATIVA` (`"assistencia"` | `"estetica"`), decides which vertical's interface a given client's deployment serves. The inactive vertical must be 100% hidden — not rendered, not routed to, not shipped in the client bundle for that deployment.
2. **Capture module (front-end).** Landing pages with input masks, character counters, and Zod validation, persisting leads to Neon Postgres. **Status: implemented** (lead forms + Server Actions + Prisma).
3. **Manager module (restricted dashboard / internal CRM).** Where the business owner manages captured leads. Lives under `/dashboard`, gated by login. **Status: implemented** (leads list, status pipeline, WhatsApp deep link).
4. **Laudo Técnico ("Anti-Malandro").** An internal tool to issue a Service Order / intake report recording the vehicle/device's condition at drop-off. Must generate a tamper-evident PDF/summary to send over WhatsApp to the client, protecting the business against fraud or bad-faith damage claims. **Status: implemented** (`/dashboard/laudo`).
5. **Business model (billing).** 7-day free trial → full lockout on expiry. **Status: implemented (Asaas), except the live checkout link.**
   - **Auth:** single-admin login (`Admin` model, scrypt-hashed password, JWT session cookie verified in `src/proxy.ts`) gates `/dashboard` and `/assinatura`. Provision/rotate via `scripts/create-admin.ts` (reads `ADMIN_EMAIL`/`ADMIN_PASSWORD`).
   - **Access rule:** `resolveAccessState` (`src/server/services/billing/access.ts`) is the single source of truth — an `ACTIVE` subscription with a valid `currentPeriodEnd` wins; otherwise the 7-day window from `Admin.trialStartedAt` applies; else `EXPIRED`. Enforced in the dashboard layout via `requireDashboardAccess`, which redirects expired admins to `/assinatura` (full lockout — data is preserved, not deleted).
   - **Webhook:** `POST /api/webhooks/asaas` authenticates via the `asaas-access-token` header (timing-safe compare against `ASAAS_WEBHOOK_TOKEN`) and maps payment events to `Subscription.status`. Updated only by this receiver, never client-side.
   - **Remaining to go live:** set `ASAAS_WEBHOOK_TOKEN` + `ASAAS_CHECKOUT_URL`, create the plan in the Asaas dashboard, and point its webhook at `/api/webhooks/asaas`. Until `ASAAS_CHECKOUT_URL` is set, `/assinatura` shows a config notice instead of a fake checkout button.
