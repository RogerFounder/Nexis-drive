-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NOVO', 'CONTATADO', 'CONVERTIDO', 'DESCARTADO');

-- CreateTable
CREATE TABLE "assistencia_tecnica_leads" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "modeloDispositivo" TEXT NOT NULL,
    "descricaoProblema" TEXT NOT NULL,
    "status" "LeadStatus" NOT NULL DEFAULT 'NOVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assistencia_tecnica_leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estetica_motor_leads" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "veiculo" TEXT NOT NULL,
    "servicoDesejado" TEXT NOT NULL,
    "status" "LeadStatus" NOT NULL DEFAULT 'NOVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estetica_motor_leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "assistencia_tecnica_leads_whatsapp_idx" ON "assistencia_tecnica_leads"("whatsapp");

-- CreateIndex
CREATE INDEX "assistencia_tecnica_leads_status_idx" ON "assistencia_tecnica_leads"("status");

-- CreateIndex
CREATE INDEX "estetica_motor_leads_whatsapp_idx" ON "estetica_motor_leads"("whatsapp");

-- CreateIndex
CREATE INDEX "estetica_motor_leads_status_idx" ON "estetica_motor_leads"("status");
