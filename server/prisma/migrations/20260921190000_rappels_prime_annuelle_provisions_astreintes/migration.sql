-- Rappels de salaire, prime de fin d'année, arrêtés de provision et astreintes.
-- Quatre colonnes s'ajoutent au bulletin : un rappel n'est pas une prime, et
-- une indemnité d'astreinte n'en est pas une non plus — chacun sa ligne.

-- AlterTable
ALTER TABLE "Payroll" ADD COLUMN     "indemnite_astreinte" DOUBLE PRECISION,
ADD COLUMN     "prime_annuelle" DOUBLE PRECISION,
ADD COLUMN     "rappel_detail" JSONB,
ADD COLUMN     "rappel_salaire" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "rappel_salaire" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "motif" TEXT NOT NULL,
    "date_effet" TIMESTAMP(3) NOT NULL,
    "periode_debut" TIMESTAMP(3) NOT NULL,
    "periode_fin" TIMESTAMP(3) NOT NULL,
    "lignes" JSONB NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'A_VERSER',
    "payroll_id" TEXT,
    "verse_le" TIMESTAMP(3),
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cree_par" TEXT,

    CONSTRAINT "rappel_salaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prime_annuelle" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "annee" INTEGER NOT NULL,
    "base" DOUBLE PRECISION NOT NULL,
    "mois_comptes" DOUBLE PRECISION NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'A_VERSER',
    "periode_versement" TIMESTAMP(3),
    "payroll_id" TEXT,
    "verse_le" TIMESTAMP(3),
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cree_par" TEXT,

    CONSTRAINT "prime_annuelle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "arrete_provision" (
    "id" TEXT NOT NULL,
    "arrete_au" TIMESTAMP(3) NOT NULL,
    "lignes" JSONB NOT NULL,
    "total_conges" DOUBLE PRECISION NOT NULL,
    "total_charges" DOUBLE PRECISION NOT NULL,
    "salaries" INTEGER NOT NULL,
    "note" TEXT,
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cree_par" TEXT,

    CONSTRAINT "arrete_provision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "astreinte" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "debut" TIMESTAMP(3) NOT NULL,
    "fin" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "site" TEXT,
    "compensation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "interventions" INTEGER NOT NULL DEFAULT 0,
    "commentaire" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'PLANIFIEE',
    "payroll_id" TEXT,
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cree_par" TEXT,

    CONSTRAINT "astreinte_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rappel_salaire_employee_id_statut_idx" ON "rappel_salaire"("employee_id", "statut");

-- CreateIndex
CREATE INDEX "prime_annuelle_statut_idx" ON "prime_annuelle"("statut");

-- CreateIndex
CREATE UNIQUE INDEX "prime_annuelle_employee_id_annee_key" ON "prime_annuelle"("employee_id", "annee");

-- CreateIndex
CREATE INDEX "arrete_provision_arrete_au_idx" ON "arrete_provision"("arrete_au");

-- CreateIndex
CREATE INDEX "astreinte_debut_idx" ON "astreinte"("debut");

-- CreateIndex
CREATE INDEX "astreinte_employee_id_statut_idx" ON "astreinte"("employee_id", "statut");

-- AddForeignKey
ALTER TABLE "rappel_salaire" ADD CONSTRAINT "rappel_salaire_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prime_annuelle" ADD CONSTRAINT "prime_annuelle_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "astreinte" ADD CONSTRAINT "astreinte_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

