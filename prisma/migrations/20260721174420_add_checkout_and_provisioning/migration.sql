-- CreateEnum
CREATE TYPE "CheckoutSessionStatus" AS ENUM ('AWAITING_PAYMENT', 'PAID', 'DISPATCHED');

-- CreateEnum
CREATE TYPE "ProvisioningStatus" AS ENUM ('PENDING', 'DISPATCHED', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "checkout_sessions" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cpfCnpj" TEXT NOT NULL,
    "asaasCustomerId" TEXT NOT NULL,
    "asaasSubscriptionId" TEXT NOT NULL,
    "invoiceUrl" TEXT NOT NULL,
    "status" "CheckoutSessionStatus" NOT NULL DEFAULT 'AWAITING_PAYMENT',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checkout_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provisioning_requests" (
    "id" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientSlug" TEXT NOT NULL,
    "vertical" TEXT NOT NULL,
    "adminEmail" TEXT NOT NULL,
    "asaasCustomerId" TEXT NOT NULL,
    "asaasSubscriptionId" TEXT NOT NULL,
    "status" "ProvisioningStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "githubRunId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "checkoutSessionId" TEXT,

    CONSTRAINT "provisioning_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "checkout_sessions_token_key" ON "checkout_sessions"("token");

-- CreateIndex
CREATE INDEX "checkout_sessions_token_idx" ON "checkout_sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "provisioning_requests_checkoutSessionId_key" ON "provisioning_requests"("checkoutSessionId");

-- AddForeignKey
ALTER TABLE "provisioning_requests" ADD CONSTRAINT "provisioning_requests_checkoutSessionId_fkey" FOREIGN KEY ("checkoutSessionId") REFERENCES "checkout_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
