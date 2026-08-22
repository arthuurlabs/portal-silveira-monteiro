-- CreateEnum
CREATE TYPE "PersonType" AS ENUM ('FISICA', 'JURIDICA');

-- DropForeignKey
ALTER TABLE "companies" DROP CONSTRAINT "companies_legal_representative_id_fkey";

-- DropForeignKey
ALTER TABLE "documents" DROP CONSTRAINT "documents_company_id_fkey";

-- DropForeignKey
ALTER TABLE "intakes" DROP CONSTRAINT "intakes_company_id_fkey";

-- DropIndex
DROP INDEX "documents_client_id_company_id_created_at_idx";

-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "cnpj" TEXT,
ADD COLUMN     "nome_fantasia" TEXT,
ADD COLUMN     "person_type" "PersonType" NOT NULL DEFAULT 'FISICA',
ADD COLUMN     "razao_social" TEXT,
ALTER COLUMN "cpf" DROP NOT NULL;

-- AlterTable
ALTER TABLE "documents" DROP COLUMN "company_id";

-- AlterTable
ALTER TABLE "intakes" DROP COLUMN "company_id";

-- DropTable
DROP TABLE "companies";

-- CreateIndex
CREATE UNIQUE INDEX "clients_cnpj_key" ON "clients"("cnpj");

-- CreateIndex
CREATE INDEX "documents_client_id_created_at_idx" ON "documents"("client_id", "created_at" DESC);

