-- CreateEnum
CREATE TYPE "PracticeArea" AS ENUM ('PREVIDENCIARIO', 'TRABALHISTA', 'CIVEL', 'FAMILIA', 'CONSUMIDOR', 'EMPRESARIAL', 'CONTRATOS', 'OUTRO');

-- CreateEnum
CREATE TYPE "NextStep" AS ENUM ('SOLICITAR_DOCUMENTOS', 'ELABORAR_PARECER', 'AGENDAR_RETORNO', 'ELABORAR_CONTRATO', 'PROTOCOLAR_ACAO', 'TENTATIVA_ACORDO', 'OUTRO');

-- CreateEnum
CREATE TYPE "ReferralSource" AS ENUM ('INDICACAO', 'INSTAGRAM', 'FACEBOOK', 'GOOGLE', 'SITE', 'OUTRO');

-- CreateTable
CREATE TABLE "intakes" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "practice_areas" "PracticeArea"[],
    "practice_area_other" TEXT,
    "client_report" TEXT,
    "lawyer_analysis" TEXT,
    "next_steps" "NextStep"[],
    "next_steps_other" TEXT,
    "fee_amount" DOUBLE PRECISION,
    "payment_method" TEXT,
    "referral_source" "ReferralSource",
    "referred_by_name" TEXT,
    "referral_source_other" TEXT,
    "lgpd_consent" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "intakes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "intakes_client_id_created_at_idx" ON "intakes"("client_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "intakes" ADD CONSTRAINT "intakes_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intakes" ADD CONSTRAINT "intakes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
