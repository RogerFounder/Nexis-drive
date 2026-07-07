-- DropForeignKey
ALTER TABLE "laudos" DROP CONSTRAINT "laudos_assistenciaLeadId_fkey";

-- DropForeignKey
ALTER TABLE "laudos" DROP CONSTRAINT "laudos_esteticaLeadId_fkey";

-- AlterTable
ALTER TABLE "assistencia_tecnica_leads" ADD COLUMN     "consentimentoDadosEm" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "estetica_motor_leads" ADD COLUMN     "consentimentoDadosEm" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "laudos" ADD CONSTRAINT "laudos_assistenciaLeadId_fkey" FOREIGN KEY ("assistenciaLeadId") REFERENCES "assistencia_tecnica_leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "laudos" ADD CONSTRAINT "laudos_esteticaLeadId_fkey" FOREIGN KEY ("esteticaLeadId") REFERENCES "estetica_motor_leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
