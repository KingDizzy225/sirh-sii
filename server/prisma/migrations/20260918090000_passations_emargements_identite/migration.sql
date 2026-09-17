-- Passations d'équipe, émargement des formations, identité de l'entreprise.

CREATE TABLE "passation" (
    "id" TEXT NOT NULL,
    "work_site_id" TEXT NOT NULL,
    "auteur_id" TEXT NOT NULL,
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "passation_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "passation_work_site_id_cree_le_idx" ON "passation"("work_site_id", "cree_le");
ALTER TABLE "passation" ADD CONSTRAINT "passation_work_site_id_fkey"
    FOREIGN KEY ("work_site_id") REFERENCES "WorkSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "passation" ADD CONSTRAINT "passation_auteur_id_fkey"
    FOREIGN KEY ("auteur_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "element_passation" (
    "id" TEXT NOT NULL,
    "passation_id" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "texte" TEXT NOT NULL,
    "resolu_le" TIMESTAMP(3),
    "resolu_par_id" TEXT,
    CONSTRAINT "element_passation_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "element_passation_passation_id_idx" ON "element_passation"("passation_id");
CREATE INDEX "element_passation_categorie_resolu_le_idx" ON "element_passation"("categorie", "resolu_le");
ALTER TABLE "element_passation" ADD CONSTRAINT "element_passation_passation_id_fkey"
    FOREIGN KEY ("passation_id") REFERENCES "passation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "element_passation" ADD CONSTRAINT "element_passation_resolu_par_id_fkey"
    FOREIGN KEY ("resolu_par_id") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "acquittement_passation" (
    "id" TEXT NOT NULL,
    "passation_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "acquitte_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "acquittement_passation_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "acquittement_passation_passation_id_employee_id_key" ON "acquittement_passation"("passation_id", "employee_id");
ALTER TABLE "acquittement_passation" ADD CONSTRAINT "acquittement_passation_passation_id_fkey"
    FOREIGN KEY ("passation_id") REFERENCES "passation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "acquittement_passation" ADD CONSTRAINT "acquittement_passation_employee_id_fkey"
    FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "session_emargement" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "secret" TEXT,
    "ouverte_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ouverte_par" TEXT,
    "fermee_le" TIMESTAMP(3),
    CONSTRAINT "session_emargement_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "session_emargement_session_id_key" ON "session_emargement"("session_id");
CREATE UNIQUE INDEX "session_emargement_token_key" ON "session_emargement"("token");
ALTER TABLE "session_emargement" ADD CONSTRAINT "session_emargement_session_id_fkey"
    FOREIGN KEY ("session_id") REFERENCES "TrainingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "emargement" (
    "id" TEXT NOT NULL,
    "session_emargement_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "arrivee_le" TIMESTAMP(3) NOT NULL,
    "depart_le" TIMESTAMP(3),
    "inscrit" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "emargement_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "emargement_session_emargement_id_employee_id_key" ON "emargement"("session_emargement_id", "employee_id");
ALTER TABLE "emargement" ADD CONSTRAINT "emargement_session_emargement_id_fkey"
    FOREIGN KEY ("session_emargement_id") REFERENCES "session_emargement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "emargement" ADD CONSTRAINT "emargement_employee_id_fkey"
    FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "identite_entreprise" (
    "id" TEXT NOT NULL DEFAULT 'principale',
    "nom_commercial" TEXT,
    "raison_sociale" TEXT,
    "rccm" TEXT,
    "adresse" TEXT,
    "ville" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "site_web" TEXT,
    "slogan" TEXT,
    "couleur_principale" TEXT NOT NULL DEFAULT '#f97316',
    "couleur_secondaire" TEXT NOT NULL DEFAULT '#7e22ce',
    "logo_path" TEXT,
    "maj_le" TIMESTAMP(3) NOT NULL,
    "maj_par" TEXT,
    CONSTRAINT "identite_entreprise_pkey" PRIMARY KEY ("id")
);
