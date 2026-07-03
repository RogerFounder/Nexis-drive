-- CreateTable
CREATE TABLE "laudos" (
    "id" TEXT NOT NULL,
    "numero" SERIAL NOT NULL,
    "clienteNome" TEXT NOT NULL,
    "clienteWhatsapp" TEXT NOT NULL,
    "identificadorLabel" TEXT NOT NULL,
    "identificadorValor" TEXT NOT NULL,
    "itensChecklist" TEXT[],
    "observacoesEntrada" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assistenciaLeadId" TEXT,
    "esteticaLeadId" TEXT,

    CONSTRAINT "laudos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "laudos_numero_key" ON "laudos"("numero");

-- CreateIndex
CREATE INDEX "laudos_assistenciaLeadId_idx" ON "laudos"("assistenciaLeadId");

-- CreateIndex
CREATE INDEX "laudos_esteticaLeadId_idx" ON "laudos"("esteticaLeadId");

-- AddForeignKey
ALTER TABLE "laudos" ADD CONSTRAINT "laudos_assistenciaLeadId_fkey" FOREIGN KEY ("assistenciaLeadId") REFERENCES "assistencia_tecnica_leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "laudos" ADD CONSTRAINT "laudos_esteticaLeadId_fkey" FOREIGN KEY ("esteticaLeadId") REFERENCES "estetica_motor_leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
