import { prisma } from "@/server/db/client";
import type { ProvisioningRequest, ProvisioningStatus } from "@/generated/prisma/client";

export function createProvisioningRequest(data: {
  clientName: string;
  clientSlug: string;
  vertical: string;
  adminEmail: string;
  asaasCustomerId: string;
  asaasSubscriptionId: string;
  checkoutSessionId: string;
}): Promise<ProvisioningRequest> {
  return prisma.provisioningRequest.create({ data });
}

export function findProvisioningRequestById(id: string): Promise<ProvisioningRequest | null> {
  return prisma.provisioningRequest.findUnique({ where: { id } });
}

export async function updateProvisioningRequest(
  id: string,
  data: { status: ProvisioningStatus; errorMessage?: string; githubRunId?: string }
): Promise<void> {
  await prisma.provisioningRequest.update({ where: { id }, data });
}
