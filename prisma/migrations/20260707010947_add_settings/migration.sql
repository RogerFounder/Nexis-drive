-- CreateEnum
CREATE TYPE "MotorServiceMode" AS ENUM ('ESTETICA', 'OFICINA', 'AMBOS');

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "motorServiceMode" "MotorServiceMode",
    "checklistItems" TEXT[],
    "onboardingDone" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "adminId" TEXT NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "settings_adminId_key" ON "settings"("adminId");

-- AddForeignKey
ALTER TABLE "settings" ADD CONSTRAINT "settings_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
