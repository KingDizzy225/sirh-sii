-- Procédures disciplinaires et de rupture.
-- Le dossier disciplinaire enregistrait la décision sans rien savoir du chemin
-- qui y mène. C'est pourtant la forme qui se conteste.

CREATE TABLE "procedures" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "motif" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'EN_COURS',
    "issue" TEXT,
    "ouverte_par" TEXT NOT NULL,
    "ouverte_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cloturee_le" TIMESTAMP(3),
    "cloturee_par" TEXT,

    CONSTRAINT "procedures_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "procedure_etapes" (
    "id" TEXT NOT NULL,
    "procedure_id" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "attendu" TEXT NOT NULL,
    "obligatoire" BOOLEAN NOT NULL DEFAULT true,
    "delai_min_jours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "delai_max_jours" DOUBLE PRECISION,
    "motif_delai" TEXT,
    "faite_le" TIMESTAMP(3),
    "faite_par" TEXT,
    "note" TEXT,
    "preuve" TEXT,

    CONSTRAINT "procedure_etapes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "procedures_statut_type_idx" ON "procedures"("statut", "type");
CREATE INDEX "procedure_etapes_procedure_id_ordre_idx" ON "procedure_etapes"("procedure_id", "ordre");

ALTER TABLE "procedures" ADD CONSTRAINT "procedures_employee_id_fkey"
    FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "procedure_etapes" ADD CONSTRAINT "procedure_etapes_procedure_id_fkey"
    FOREIGN KEY ("procedure_id") REFERENCES "procedures"("id") ON DELETE CASCADE ON UPDATE CASCADE;
