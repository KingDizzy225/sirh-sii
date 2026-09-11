-- Clôture mensuelle de la paie, et conservation des bulletins remplacés.
--
-- Relancer la paie d'un mois supprimait ses bulletins et les recréait. Un
-- bulletin signé disparaissait, et le lien de retrait transmis au salarié
-- répondait « Bulletin introuvable ».

CREATE TABLE "cloture_paie" (
    "id" TEXT NOT NULL,
    "periode" TEXT NOT NULL,
    "cloture_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cloture_par" TEXT NOT NULL,
    "effectif" INTEGER NOT NULL,
    "masse_brute" DOUBLE PRECISION NOT NULL,
    "net_total" DOUBLE PRECISION NOT NULL,
    "avertissements" JSONB,
    "reouvert_le" TIMESTAMP(3),
    "reouvert_par" TEXT,
    "motif_reouverture" TEXT,

    CONSTRAINT "cloture_paie_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "cloture_paie_periode_cloture_le_idx" ON "cloture_paie"("periode", "cloture_le");

CREATE TABLE "bulletin_remplace" (
    "id" TEXT NOT NULL,
    "payroll_id_origine" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "periode" TIMESTAMP(3) NOT NULL,
    "donnees" JSONB NOT NULL,
    "pdf_path" TEXT,
    "signe_le" TIMESTAMP(3),
    "remplace_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remplace_par" TEXT,
    "remplace_par_payroll_id" TEXT,

    CONSTRAINT "bulletin_remplace_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "bulletin_remplace_employee_id_periode_idx" ON "bulletin_remplace"("employee_id", "periode");

ALTER TABLE "bulletin_remplace" ADD CONSTRAINT "bulletin_remplace_employee_id_fkey"
    FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
