-- CreateTable
CREATE TABLE "WorkAccident" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "days_off" INTEGER NOT NULL DEFAULT 0,
    "declared_to_cnps" BOOLEAN NOT NULL DEFAULT false,
    "declared_at" TIMESTAMP(3),
    "corrective_action" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Déclaré',
    "reported_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkAccident_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkAccident_reference_key" ON "WorkAccident"("reference");

-- CreateIndex
CREATE INDEX "WorkAccident_occurred_at_idx" ON "WorkAccident"("occurred_at");

-- AddForeignKey
ALTER TABLE "WorkAccident" ADD CONSTRAINT "WorkAccident_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

