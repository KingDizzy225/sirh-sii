-- Pointage sur l'écran d'agence, bourse aux remplacements, pré-accueil, livre d'or.

ALTER TABLE "ecran_agence" ADD COLUMN "pointage_actif" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ecran_agence" ADD COLUMN "secret_pointage" TEXT;

CREATE TABLE "demande_remplacement" (
    "id" TEXT NOT NULL,
    "shift_id" TEXT NOT NULL,
    "demandeur_id" TEXT NOT NULL,
    "remplacant_id" TEXT,
    "motif" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'OUVERTE',
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptee_le" TIMESTAMP(3),
    "decidee_le" TIMESTAMP(3),
    "decidee_par" TEXT,
    "motif_refus" TEXT,

    CONSTRAINT "demande_remplacement_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "demande_remplacement_statut_cree_le_idx" ON "demande_remplacement"("statut", "cree_le");
CREATE INDEX "demande_remplacement_shift_id_idx" ON "demande_remplacement"("shift_id");

ALTER TABLE "demande_remplacement" ADD CONSTRAINT "demande_remplacement_shift_id_fkey"
    FOREIGN KEY ("shift_id") REFERENCES "ShiftSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "demande_remplacement" ADD CONSTRAINT "demande_remplacement_demandeur_id_fkey"
    FOREIGN KEY ("demandeur_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "demande_remplacement" ADD CONSTRAINT "demande_remplacement_remplacant_id_fkey"
    FOREIGN KEY ("remplacant_id") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "pre_accueil" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "responsable_id" TEXT,
    "work_site_id" TEXT,
    "heure_arrivee" TEXT,
    "programme" TEXT,
    "mot_accueil" TEXT,
    "pieces_attendues" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cree_par" TEXT,
    "ouvert_le" TIMESTAMP(3),
    "ouvertures" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "pre_accueil_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pre_accueil_token_key" ON "pre_accueil"("token");
CREATE UNIQUE INDEX "pre_accueil_employee_id_key" ON "pre_accueil"("employee_id");

ALTER TABLE "pre_accueil" ADD CONSTRAINT "pre_accueil_employee_id_fkey"
    FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pre_accueil" ADD CONSTRAINT "pre_accueil_responsable_id_fkey"
    FOREIGN KEY ("responsable_id") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "pre_accueil" ADD CONSTRAINT "pre_accueil_work_site_id_fkey"
    FOREIGN KEY ("work_site_id") REFERENCES "WorkSite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "livre_dor" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "occasion" TEXT NOT NULL,
    "beneficiaire_id" TEXT NOT NULL,
    "jeton_contribution" TEXT NOT NULL,
    "jeton_remise" TEXT NOT NULL,
    "date_remise" TIMESTAMP(3) NOT NULL,
    "afficher_mur" BOOLEAN NOT NULL DEFAULT false,
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cree_par" TEXT,
    "cloture_le" TIMESTAMP(3),
    "remise_ouverte_le" TIMESTAMP(3),

    CONSTRAINT "livre_dor_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "livre_dor_jeton_contribution_key" ON "livre_dor"("jeton_contribution");
CREATE UNIQUE INDEX "livre_dor_jeton_remise_key" ON "livre_dor"("jeton_remise");
CREATE INDEX "livre_dor_date_remise_idx" ON "livre_dor"("date_remise");

ALTER TABLE "livre_dor" ADD CONSTRAINT "livre_dor_beneficiaire_id_fkey"
    FOREIGN KEY ("beneficiaire_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "mot_livre_dor" (
    "id" TEXT NOT NULL,
    "livre_id" TEXT NOT NULL,
    "auteur" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "masque" BOOLEAN NOT NULL DEFAULT false,
    "empreinte_ip" TEXT,

    CONSTRAINT "mot_livre_dor_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "mot_livre_dor_livre_id_cree_le_idx" ON "mot_livre_dor"("livre_id", "cree_le");

ALTER TABLE "mot_livre_dor" ADD CONSTRAINT "mot_livre_dor_livre_id_fkey"
    FOREIGN KEY ("livre_id") REFERENCES "livre_dor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
