-- CreateEnum
CREATE TYPE "CheckoutPlanType" AS ENUM ('MENSAL', 'VITALICIO');

-- AlterTable: make asaasSubscriptionId nullable and add planType
ALTER TABLE "checkout_sessions"
  ADD COLUMN "planType" "CheckoutPlanType" NOT NULL DEFAULT 'MENSAL',
  ALTER COLUMN "asaasSubscriptionId" DROP NOT NULL;
