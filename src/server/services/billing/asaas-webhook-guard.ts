/**
 * Multi-deployment safety guard: every deployment that registers a webhook
 * on the same Asaas account receives EVERY event from that account, not
 * just events for its own client (Asaas webhooks are account-wide, not
 * scoped to a customer or payment link). When `expectedCustomerId` is set,
 * events for any other customer must be ignored outright — no fallback — so
 * one client's payment can never be mistaken for another's. It should only
 * be left unset for a deployment that is the *sole* listener on its Asaas
 * account (e.g. a template/demo deployment); every real client deployment
 * must set it once their dedicated Asaas customer/subscription exists.
 *
 * Kept in its own zero-dependency module (no Prisma import) so this
 * property is unit-tested directly, without needing a database connection.
 */
export function isEventForThisDeployment(
  customerId: string | null,
  expectedCustomerId: string | null | undefined
): boolean {
  if (!expectedCustomerId) return true;
  return customerId === expectedCustomerId;
}
