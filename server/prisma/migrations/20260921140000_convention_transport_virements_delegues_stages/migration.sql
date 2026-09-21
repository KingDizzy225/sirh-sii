-- Grille conventionnelle, prime de transport et avantages en nature,
-- lots de virement, délégués du personnel, conventions de stage.

ALTER TABLE "Employee" ADD COLUMN "categorie_convention" TEXT;
ALTER TABLE "Employee" ADD COLUMN "echelon_convention" TEXT;
ALTER TABLE "Employee" ADD COLUMN "prime_transport" DOUBLE PRECISION;

ALTER TABLE "Payroll" ADD COLUMN "prime_transport" DOUBLE PRECISION;
ALTER TABLE "Payroll" ADD COLUMN "prime_transport_imposable" DOUBLE PRECISION;
ALTER TABLE "Payroll" ADD COLUMN "avantages_nature" DOUBLE PRECISION;
ALTER TABLE "Payroll" ADD COLUMN "avantages_nature_detail" JSONB;

CREATE TABLE "avantage_nature" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "montant_mensuel" DOUBLE PRECISION NOT NULL,
    "debut" TIMESTAMP(3) NOT NULL,
    "fin" TIMESTAMP(3),
    "note" TEXT,
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cree_par" TEXT,
    CONSTRAINT "avantage_nature_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "avantage_nature_employee_id_debut_idx" ON "avantage_nature"("employee_id", "debut");
ALTER TABLE "avantage_nature" ADD CONSTRAINT "avantage_nature_employee_id_fkey"
    FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "grille_convention" (
    "id" TEXT NOT NULL,
    "convention" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "echelon" TEXT NOT NULL DEFAULT '—',
    "salaire_minimum" DOUBLE PRECISION NOT NULL,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cree_par" TEXT,
    CONSTRAINT "grille_convention_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "grille_convention_convention_categorie_echelon_key"
    ON "grille_convention"("convention", "categorie", "echelon");

CREATE TABLE "format_virement" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'CSV',
    "separateur" TEXT NOT NULL DEFAULT ';',
    "extension" TEXT NOT NULL DEFAULT 'csv',
    "colonnes" JSONB NOT NULL,
    "entete" JSONB,
    "pied" JSONB,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cree_par" TEXT,
    CONSTRAINT "format_virement_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "format_virement_nom_key" ON "format_virement"("nom");

CREATE TABLE "lot_virement" (
    "id" TEXT NOT NULL,
    "periode" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'PREPARE',
    "format_id" TEXT,
    "format_nom" TEXT NOT NULL,
    "nombre_lignes" INTEGER NOT NULL,
    "montant_total" DOUBLE PRECISION NOT NULL,
    "empreinte" TEXT,
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cree_par" TEXT,
    "emis_le" TIMESTAMP(3),
    "emis_par" TEXT,
    "annule_le" TIMESTAMP(3),
    "annule_motif" TEXT,
    CONSTRAINT "lot_virement_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "lot_virement_periode_cree_le_idx" ON "lot_virement"("periode", "cree_le");
ALTER TABLE "lot_virement" ADD CONSTRAINT "lot_virement_format_id_fkey"
    FOREIGN KEY ("format_id") REFERENCES "format_virement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "ligne_virement" (
    "id" TEXT NOT NULL,
    "lot_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "payroll_id" TEXT,
    "nom" TEXT NOT NULL,
    "banque" TEXT,
    "compte" TEXT NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "reference" TEXT NOT NULL,
    CONSTRAINT "ligne_virement_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ligne_virement_lot_id_idx" ON "ligne_virement"("lot_id");
ALTER TABLE "ligne_virement" ADD CONSTRAINT "ligne_virement_lot_id_fkey"
    FOREIGN KEY ("lot_id") REFERENCES "lot_virement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ligne_virement" ADD CONSTRAINT "ligne_virement_employee_id_fkey"
    FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "scrutin" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "tour" INTEGER NOT NULL DEFAULT 1,
    "college" TEXT NOT NULL DEFAULT 'UNIQUE',
    "inscrits" INTEGER NOT NULL,
    "votants" INTEGER NOT NULL,
    "observations" TEXT,
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cree_par" TEXT,
    CONSTRAINT "scrutin_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "scrutin_date_idx" ON "scrutin"("date");

CREATE TABLE "mandat_delegue" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "scrutin_id" TEXT,
    "college" TEXT NOT NULL DEFAULT 'UNIQUE',
    "qualite" TEXT NOT NULL DEFAULT 'TITULAIRE',
    "debut" TIMESTAMP(3) NOT NULL,
    "fin" TIMESTAMP(3) NOT NULL,
    "fin_anticipee_le" TIMESTAMP(3),
    "fin_anticipee_motif" TEXT,
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "mandat_delegue_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "mandat_delegue_fin_idx" ON "mandat_delegue"("fin");
ALTER TABLE "mandat_delegue" ADD CONSTRAINT "mandat_delegue_employee_id_fkey"
    FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mandat_delegue" ADD CONSTRAINT "mandat_delegue_scrutin_id_fkey"
    FOREIGN KEY ("scrutin_id") REFERENCES "scrutin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "reunion_delegues" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "objet" TEXT NOT NULL,
    "compte_rendu" TEXT,
    "presents" JSONB,
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cree_par" TEXT,
    CONSTRAINT "reunion_delegues_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "reunion_delegues_date_idx" ON "reunion_delegues"("date");

CREATE TABLE "convention_stage" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "ecole" TEXT,
    "niveau" TEXT,
    "tuteur_id" TEXT,
    "debut" TIMESTAMP(3) NOT NULL,
    "fin" TIMESTAMP(3) NOT NULL,
    "gratification_mensuelle" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "objet" TEXT,
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cree_par" TEXT,
    CONSTRAINT "convention_stage_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "convention_stage_employee_id_key" ON "convention_stage"("employee_id");
CREATE INDEX "convention_stage_fin_idx" ON "convention_stage"("fin");
ALTER TABLE "convention_stage" ADD CONSTRAINT "convention_stage_employee_id_fkey"
    FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "convention_stage" ADD CONSTRAINT "convention_stage_tuteur_id_fkey"
    FOREIGN KEY ("tuteur_id") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
