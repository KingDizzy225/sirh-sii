-- Ordres de mission, créances d'indemnités journalières CNPS, et la
-- reconnaissance de travailleur handicapé, qui n'existait que comme chiffre
-- affiché sans donnée derrière lui.

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "handicap_amenagement" TEXT,
ADD COLUMN     "handicap_reconnu_le" TIMESTAMP(3),
ADD COLUMN     "travailleur_handicape" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ordre_mission" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "objet" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "debut" TIMESTAMP(3) NOT NULL,
    "fin" TIMESTAMP(3) NOT NULL,
    "per_diem_jour" DOUBLE PRECISION,
    "montant_prevu" DOUBLE PRECISION,
    "avance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "moyen_transport" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'DEMANDEE',
    "autorise_par" TEXT,
    "autorisee_le" TIMESTAMP(3),
    "motif_refus" TEXT,
    "compte_rendu" TEXT,
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cree_par" TEXT,

    CONSTRAINT "ordre_mission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "indemnite_journaliere" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "origine_id" TEXT NOT NULL,
    "debut" TIMESTAMP(3) NOT NULL,
    "fin" TIMESTAMP(3) NOT NULL,
    "jours" INTEGER NOT NULL,
    "salaire_journalier" DOUBLE PRECISION,
    "montant_estime" DOUBLE PRECISION,
    "montant_reclame" DOUBLE PRECISION,
    "montant_rembourse" DOUBLE PRECISION,
    "statut" TEXT NOT NULL DEFAULT 'A_RECLAMER',
    "reference" TEXT,
    "reclamee_le" TIMESTAMP(3),
    "remboursee_le" TIMESTAMP(3),
    "note" TEXT,
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cree_par" TEXT,

    CONSTRAINT "indemnite_journaliere_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ordre_mission_debut_idx" ON "ordre_mission"("debut");

-- CreateIndex
CREATE INDEX "ordre_mission_employee_id_statut_idx" ON "ordre_mission"("employee_id", "statut");

-- CreateIndex
CREATE UNIQUE INDEX "indemnite_journaliere_origine_id_key" ON "indemnite_journaliere"("origine_id");

-- CreateIndex
CREATE INDEX "indemnite_journaliere_statut_idx" ON "indemnite_journaliere"("statut");

-- AddForeignKey
ALTER TABLE "ordre_mission" ADD CONSTRAINT "ordre_mission_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indemnite_journaliere" ADD CONSTRAINT "indemnite_journaliere_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

