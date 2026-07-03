import { prisma } from "@/server/db/client";
import type { Subscription, SubscriptionStatus } from "@/generated/prisma/client";

export function getSubscriptionByAsaasCustomerId(
  asaasCustomerId: string
): Promise<Subscription | null> {
  return prisma.subscription.findFirst({ where: { asaasCustomerId } });
}

/** Single-tenant fallback: the only subscription row, if one exists. */
export function getSoleSubscription(): Promise<Subscription | null> {
  return prisma.subscription.findFirst();
}

interface UpsertSubscriptionInput {
  adminId: string;
  status: SubscriptionStatus;
  asaasCustomerId?: string | null;
  asaasSubscriptionId?: string | null;
  currentPeriodEnd?: Date | null;
}

export function upsertSubscriptionForAdmin(input: UpsertSubscriptionInput): Promise<Subscription> {
  const { adminId, ...rest } = input;
  return prisma.subscription.upsert({
    where: { adminId },
    update: rest,
    create: { adminId, ...rest },
  });
}
