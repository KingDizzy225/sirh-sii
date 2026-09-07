-- Solde de congés : le forfait de 30 jours créditait une année entière à tout
-- salarié dès sa création. Le solde est désormais calculé ou repris, jamais
-- supposé. Les soldes déjà en base ne sont pas touchés ici : ils se corrigent
-- avec `npm run repair-leave-balances`, qui montre d'abord ce qu'il changerait.
ALTER TABLE "Employee" ALTER COLUMN "annual_leave_balance" SET DEFAULT 0;
ALTER TABLE "Employee" ADD COLUMN "leave_balance_source" TEXT;
ALTER TABLE "Employee" ADD COLUMN "leave_balance_set_at" TIMESTAMP(3);

-- Dossier administratif : mentions exigées par la déclaration CNPS et par le
-- registre unique du personnel.
ALTER TABLE "Employee" ADD COLUMN "matricule" TEXT;
ALTER TABLE "Employee" ADD COLUMN "cnps_number" TEXT;
ALTER TABLE "Employee" ADD COLUMN "bank_name" TEXT;
ALTER TABLE "Employee" ADD COLUMN "bank_account" TEXT;
ALTER TABLE "Employee" ADD COLUMN "children_count" INTEGER NOT NULL DEFAULT 0;

-- Un matricule identifie un salarié et un seul ; deux fois le même rendrait
-- toute déclaration ambiguë. Les valeurs nulles restent autorisées et ne se
-- gênent pas entre elles.
CREATE UNIQUE INDEX "Employee_matricule_key" ON "Employee"("matricule");

-- CreateTable
CREATE TABLE "deleted_employees" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "position_title" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "related_count" INTEGER NOT NULL DEFAULT 0,
    "deleted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_by" TEXT,
    "restored_at" TIMESTAMP(3),
    "restored_by" TEXT,

    CONSTRAINT "deleted_employees_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "deleted_employees_deleted_at_idx" ON "deleted_employees"("deleted_at");

-- Guichet WhatsApp réellement branché : l'opérateur réémet un message tant
-- qu'il n'a pas d'accusé de réception. Sans clé d'unicité sur l'identifiant du
-- message, une même demande de congé serait enregistrée plusieurs fois.
ALTER TABLE "WhatsappLog" ADD COLUMN "message_id" TEXT;
ALTER TABLE "WhatsappLog" ADD COLUMN "direction" TEXT NOT NULL DEFAULT 'ENTRANT';
ALTER TABLE "WhatsappLog" ADD COLUMN "delivered" BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX "WhatsappLog_message_id_key" ON "WhatsappLog"("message_id");
CREATE INDEX "WhatsappLog_created_at_idx" ON "WhatsappLog"("created_at");
