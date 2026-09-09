-- Prêts au personnel, remboursables en plusieurs échéances.
--
-- `SalaryAdvance` ne portait qu'un seul `deducted_on_payroll_id` : une avance
-- se remboursait en une fois, sur une paie. Un salarié empruntant cinq cent
-- mille francs n'avait que deux issues — tout voir retenu d'un coup sur un
-- seul bulletin, ou faire créer par la RH cinq avances fictives dont plus rien
-- ne disait qu'elles n'en formaient qu'une.

CREATE TABLE "pret" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "motif" TEXT,
    "mensualite" DOUBLE PRECISION NOT NULL,
    "accorde_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accorde_par" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'EN_COURS',
    "annule_le" TIMESTAMP(3),
    "annule_motif" TEXT,

    CONSTRAINT "pret_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "echeance_pret" (
    "id" TEXT NOT NULL,
    "pret_id" TEXT NOT NULL,
    "rang" INTEGER NOT NULL,
    "periode" TEXT NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'A_RETENIR',
    "payroll_id" TEXT,
    "retenue_le" TIMESTAMP(3),

    CONSTRAINT "echeance_pret_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "pret_employee_id_statut_idx" ON "pret"("employee_id", "statut");
CREATE UNIQUE INDEX "echeance_pret_pret_id_rang_key" ON "echeance_pret"("pret_id", "rang");
-- La paie balaie les échéances dues d'une période : sans index, elle ferait un
-- parcours complet à chaque exécution.
CREATE INDEX "echeance_pret_periode_statut_idx" ON "echeance_pret"("periode", "statut");

ALTER TABLE "pret" ADD CONSTRAINT "pret_employee_id_fkey"
    FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "echeance_pret" ADD CONSTRAINT "echeance_pret_pret_id_fkey"
    FOREIGN KEY ("pret_id") REFERENCES "pret"("id") ON DELETE CASCADE ON UPDATE CASCADE;
