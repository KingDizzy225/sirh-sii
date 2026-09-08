-- Le salaire devient une donnée du dossier, et non plus une conséquence.
--
-- L'application ignorait ce que gagnait un salarié : la paie lisait le montant
-- dans la requête, et l'analyse d'équité le déduisait du dernier bulletin. Il
-- fallait donc ressaisir chaque salaire à chaque paie, rien ne signalait un
-- écart d'un mois sur l'autre, et une augmentation ne se décidait nulle part.
ALTER TABLE "Employee" ADD COLUMN "base_salary" DOUBLE PRECISION;
ALTER TABLE "Employee" ADD COLUMN "salary_effective_from" TIMESTAMP(3);

CREATE TABLE "salary_changes" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "previous_amount" DOUBLE PRECISION,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "motif" TEXT,
    "decide_par" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "salary_changes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "salary_changes_employee_id_effective_from_idx"
    ON "salary_changes"("employee_id", "effective_from");

ALTER TABLE "salary_changes" ADD CONSTRAINT "salary_changes_employee_id_fkey"
    FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Délégation de validation. Quand le responsable qui valide est lui-même
-- absent, les demandes s'arrêtaient : rien ne permettait de le suppléer.
CREATE TABLE "delegations_validation" (
    "id" TEXT NOT NULL,
    "titulaire_id" TEXT NOT NULL,
    "suppleant_id" TEXT NOT NULL,
    "portee" TEXT NOT NULL DEFAULT 'TOUT',
    "debut" TIMESTAMP(3) NOT NULL,
    "fin" TIMESTAMP(3) NOT NULL,
    "motif" TEXT,
    "cree_par" TEXT,
    "revoquee_le" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "delegations_validation_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "delegations_validation_titulaire_id_debut_fin_idx"
    ON "delegations_validation"("titulaire_id", "debut", "fin");
CREATE INDEX "delegations_validation_suppleant_id_idx"
    ON "delegations_validation"("suppleant_id");

ALTER TABLE "delegations_validation" ADD CONSTRAINT "delegations_validation_titulaire_id_fkey"
    FOREIGN KEY ("titulaire_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "delegations_validation" ADD CONSTRAINT "delegations_validation_suppleant_id_fkey"
    FOREIGN KEY ("suppleant_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
