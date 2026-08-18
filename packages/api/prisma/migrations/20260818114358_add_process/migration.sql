-- CreateTable
CREATE TABLE "processes" (
    "id" TEXT NOT NULL,
    "case_number" TEXT,
    "client_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "plaintiff" TEXT NOT NULL,
    "defendant" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "processes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "process_movements" (
    "id" TEXT NOT NULL,
    "process_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "occurred_at" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "process_movements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "processes_client_id_created_at_idx" ON "processes"("client_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "process_movements_process_id_occurred_at_idx" ON "process_movements"("process_id", "occurred_at" DESC);

-- AddForeignKey
ALTER TABLE "processes" ADD CONSTRAINT "processes_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processes" ADD CONSTRAINT "processes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "process_movements" ADD CONSTRAINT "process_movements_process_id_fkey" FOREIGN KEY ("process_id") REFERENCES "processes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
