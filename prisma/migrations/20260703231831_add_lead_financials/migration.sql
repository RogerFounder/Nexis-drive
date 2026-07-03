-- CreateEnum
CREATE TYPE "StatusPagamento" AS ENUM ('PENDENTE', 'PAGO');

-- AlterTable
ALTER TABLE "assistencia_tecnica_leads" ADD COLUMN     "statusPagamento" "StatusPagamento" NOT NULL DEFAULT 'PENDENTE',
ADD COLUMN     "valorServico" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "estetica_motor_leads" ADD COLUMN     "statusPagamento" "StatusPagamento" NOT NULL DEFAULT 'PENDENTE',
ADD COLUMN     "valorServico" DECIMAL(10,2);
